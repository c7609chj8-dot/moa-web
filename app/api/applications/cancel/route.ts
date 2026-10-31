import { cancelApplication } from "@/lib/applications";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>,
    id = String(body.id ?? "").trim(),
    phone = String(body.phone ?? "").replace(/\D/g, "");
  if (!/^[a-z0-9-]{20,80}$/i.test(id) || !/^01\d{8,9}$/.test(phone))
    return Response.json(
      { error: "예약번호와 휴대전화번호를 확인해 주세요." },
      { status: 400 },
    );
  try {
    const result = await cancelApplication(id, phone);
    if (!result.meta.changes)
      return Response.json(
        { error: "일치하는 예약을 찾지 못했거나 이미 취소되었습니다." },
        { status: 404 },
      );
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "취소 처리 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
