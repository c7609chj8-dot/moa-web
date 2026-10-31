import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  isValidDateKey,
  scheduleStatuses,
  type ScheduleException,
  type ScheduleRule,
  type ScheduleSettings,
} from "@/lib/schedule-types";
import { writeScheduleSettings } from "@/lib/schedule";

const ADMIN = "c7609chj8@gmail.com",
  text = (value: unknown, max = 500) =>
    String(value ?? "")
      .trim()
      .slice(0, max),
  bool = (value: unknown) => value === true,
  capacity = (value: unknown) => {
    const result = Number(value);
    return Number.isInteger(result) && result >= 0 && result <= 500
      ? result
      : 20;
  },
  time = (value: unknown) => {
    const result = text(value, 5);
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(result) ? result : "";
  },
  status = (value: unknown): ScheduleRule["status"] => {
    const result = text(value, 20);
    return scheduleStatuses.includes(result as ScheduleRule["status"])
      ? (result as ScheduleRule["status"])
      : "접수가능";
  };

async function allowed() {
  return (await getChatGPTUser())?.email.toLowerCase() === ADMIN;
}

function cleanRule(value: Partial<ScheduleRule> | undefined): ScheduleRule {
  return {
    course: text(value?.course, 120) || "건설업 기초안전보건교육",
    startTime: time(value?.startTime),
    endTime: time(value?.endTime),
    status: status(value?.status),
    fee: text(value?.fee, 50),
    supplies: text(value?.supplies, 200),
    note: text(value?.note, 1000),
    capacity: capacity(value?.capacity),
    closed: bool(value?.closed),
    reservation: bool(value?.reservation),
    registrationClosed: bool(value?.registrationClosed),
  };
}

function cleanException(
  value: Partial<ScheduleException>,
): ScheduleException | null {
  const date = text(value.date, 10),
    id = text(value.id, 80);
  if (!isValidDateKey(date)) return null;
  return {
    ...cleanRule(value),
    id: /^[a-zA-Z0-9-]+$/.test(id) ? id : crypto.randomUUID(),
    date,
  };
}

export async function POST(request: Request) {
  if (!(await allowed()))
    return Response.json({ error: "관리자 권한이 없습니다." }, { status: 403 });
  const body = (await request.json()) as Partial<ScheduleSettings>,
    exceptions = (body.exceptions ?? [])
      .slice(0, 366)
      .map(cleanException)
      .filter((item): item is ScheduleException => item !== null),
    settings: ScheduleSettings = {
      weekday: cleanRule(body.weekday),
      saturday: cleanRule(body.saturday),
      sunday: cleanRule(body.sunday),
      exceptions,
    };
  await writeScheduleSettings(settings);
  return Response.json({ ok: true });
}
