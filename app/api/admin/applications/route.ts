import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  deleteApplication,
  listApplications,
  updateApplication,
} from "@/lib/applications";
import {
  applicationStatuses,
  attendanceStatuses,
  paymentStatuses,
} from "@/lib/application-types";

const ADMIN = "c7609chj8@gmail.com";

async function allowed() {
  return (await getChatGPTUser())?.email.toLowerCase() === ADMIN;
}

export async function GET(request: Request) {
  if (!(await allowed()))
    return Response.json({ error: "관리자 권한이 없습니다." }, { status: 403 });
  const period = new URL(request.url).searchParams.get("period") ?? "month";
  return Response.json({ applications: await listApplications(period) });
}

export async function PATCH(request: Request) {
  if (!(await allowed()))
    return Response.json({ error: "관리자 권한이 없습니다." }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>,
    id = String(body.id ?? ""),
    status = String(body.status ?? ""),
    paymentStatus = String(body.paymentStatus ?? ""),
    attendanceStatus = String(body.attendanceStatus ?? ""),
    memo = String(body.memo ?? "").trim().slice(0, 1000);
  if (
    !/^[a-z0-9-]{20,80}$/i.test(id) ||
    !applicationStatuses.includes(status as never) ||
    !paymentStatuses.includes(paymentStatus as never) ||
    !attendanceStatuses.includes(attendanceStatus as never)
  )
    return Response.json({ error: "입력값을 확인해 주세요." }, { status: 400 });
  await updateApplication(id, {
    status: status as (typeof applicationStatuses)[number],
    paymentStatus: paymentStatus as (typeof paymentStatuses)[number],
    attendanceStatus: attendanceStatus as (typeof attendanceStatuses)[number],
    memo,
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await allowed()))
    return Response.json({ error: "관리자 권한이 없습니다." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[a-z0-9-]{20,80}$/i.test(id))
    return Response.json({ error: "예약번호를 확인해 주세요." }, { status: 400 });
  await deleteApplication(id);
  return Response.json({ ok: true });
}
