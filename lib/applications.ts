import { env } from "cloudflare:workers";
import type { ApplicationRecord } from "./application-types";

type ApplicationRow = {
  id: string;
  training_date: string;
  name: string;
  phone: string;
  birth_date: string;
  is_foreigner: number;
  request: string;
  status: ApplicationRecord["status"];
  payment_status: ApplicationRecord["paymentStatus"];
  attendance_status: ApplicationRecord["attendanceStatus"];
  memo: string;
  created_at: string;
  updated_at: string;
};

function fromRow(row: ApplicationRow): ApplicationRecord {
  return {
    id: row.id,
    trainingDate: row.training_date,
    name: row.name,
    phone: row.phone,
    birthDate: row.birth_date,
    isForeigner: row.is_foreigner === 1,
    request: row.request,
    status: row.status,
    paymentStatus: row.payment_status,
    attendanceStatus: row.attendance_status,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function koreaDateKey(date = new Date()) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export async function bookingCount(date: string) {
  try {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM applications WHERE training_date=? AND status<>'취소'",
    )
      .bind(date)
      .first<{ count: number }>();
    return Number(row?.count ?? 0);
  } catch {
    return 0;
  }
}

export async function bookingCounts() {
  try {
    const result = await env.DB.prepare(
      "SELECT training_date,COUNT(*) AS count FROM applications WHERE status<>'취소' GROUP BY training_date",
    ).all<{ training_date: string; count: number }>();
    return Object.fromEntries(
      result.results.map((row) => [row.training_date, Number(row.count)]),
    );
  } catch {
    return {} as Record<string, number>;
  }
}

export async function createApplication(input: {
  trainingDate: string;
  name: string;
  phone: string;
  birthDate: string;
  isForeigner: boolean;
  request: string;
  capacity: number;
}) {
  const id = crypto.randomUUID(),
    now = new Date().toISOString();
  const result = await env.DB.prepare(
    "INSERT INTO applications (id,training_date,name,phone,birth_date,is_foreigner,request,status,payment_status,attendance_status,memo,created_at,updated_at) SELECT ?,?,?,?,?,?,?,'확인대기','미결제','미처리','',?,? WHERE ?=0 OR (SELECT COUNT(*) FROM applications WHERE training_date=? AND status<>'취소')<?",
  )
    .bind(
      id,
      input.trainingDate,
      input.name,
      input.phone,
      input.birthDate,
      input.isForeigner ? 1 : 0,
      input.request,
      now,
      now,
      input.capacity,
      input.trainingDate,
      input.capacity,
    )
    .run();
  return result.meta.changes ? id : null;
}

export async function listApplications(period = "month") {
  const today = koreaDateKey(),
    month = today.slice(0, 7),
    weekEndDate = new Date(`${today}T00:00:00Z`);
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);
  let sql = "SELECT * FROM applications";
  const values: string[] = [];
  if (period === "today") {
    sql += " WHERE training_date=?";
    values.push(today);
  } else if (period === "week") {
    sql += " WHERE training_date BETWEEN ? AND ?";
    values.push(today, weekEnd);
  } else if (period === "month") {
    sql += " WHERE training_date LIKE ?";
    values.push(`${month}%`);
  }
  sql += " ORDER BY training_date ASC,created_at DESC LIMIT 500";
  const statement = env.DB.prepare(sql),
    result = await (values.length ? statement.bind(...values) : statement).all<ApplicationRow>();
  return result.results.map(fromRow);
}

export async function applicationSummary() {
  const today = koreaDateKey(),
    month = today.slice(0, 7),
    weekEndDate = new Date(`${today}T00:00:00Z`);
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);
  try {
    const [todayRow, weekRow, monthRow, pendingRow] = await Promise.all([
      env.DB.prepare(
        "SELECT COUNT(*) AS count FROM applications WHERE training_date=? AND status<>'취소'",
      )
        .bind(today)
        .first<{ count: number }>(),
      env.DB.prepare(
        "SELECT COUNT(*) AS count FROM applications WHERE training_date BETWEEN ? AND ? AND status<>'취소'",
      )
        .bind(today, weekEnd)
        .first<{ count: number }>(),
      env.DB.prepare(
        "SELECT COUNT(*) AS count FROM applications WHERE training_date LIKE ? AND status<>'취소'",
      )
        .bind(`${month}%`)
        .first<{ count: number }>(),
      env.DB.prepare(
        "SELECT COUNT(*) AS count FROM applications WHERE status='확인대기'",
      ).first<{ count: number }>(),
    ]);
    return {
      today: Number(todayRow?.count ?? 0),
      week: Number(weekRow?.count ?? 0),
      month: Number(monthRow?.count ?? 0),
      pending: Number(pendingRow?.count ?? 0),
    };
  } catch {
    return { today: 0, week: 0, month: 0, pending: 0 };
  }
}

export async function updateApplication(
  id: string,
  input: Pick<
    ApplicationRecord,
    "status" | "paymentStatus" | "attendanceStatus" | "memo"
  >,
) {
  return env.DB.prepare(
    "UPDATE applications SET status=?,payment_status=?,attendance_status=?,memo=?,updated_at=? WHERE id=?",
  )
    .bind(
      input.status,
      input.paymentStatus,
      input.attendanceStatus,
      input.memo,
      new Date().toISOString(),
      id,
    )
    .run();
}

export async function cancelApplication(id: string, phone: string) {
  return env.DB.prepare(
    "UPDATE applications SET status='취소',updated_at=? WHERE id=? AND phone=? AND status<>'취소'",
  )
    .bind(new Date().toISOString(), id, phone)
    .run();
}

export async function deleteApplication(id: string) {
  return env.DB.prepare("DELETE FROM applications WHERE id=?").bind(id).run();
}
