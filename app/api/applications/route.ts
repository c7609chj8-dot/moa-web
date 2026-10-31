import {
  bookingCount,
  createApplication,
  koreaDateKey,
} from "@/lib/applications";
import { readScheduleSettings } from "@/lib/schedule";
import {
  effectiveStatus,
  isValidDateKey,
  ruleForDate,
} from "@/lib/schedule-types";

const text = (value: unknown, max: number) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  if (text(body.website, 100))
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const trainingDate = text(body.trainingDate, 10),
    name = text(body.name, 40),
    phone = text(body.phone, 30).replace(/\D/g, ""),
    birthDate = text(body.birthDate, 10),
    requestText = text(body.request, 500),
    privacyAgreed = body.privacyAgreed === true;

  if (!isValidDateKey(trainingDate) || trainingDate < koreaDateKey())
    return Response.json(
      { error: "교육일을 다시 선택해 주세요." },
      { status: 400 },
    );
  if (name.length < 2)
    return Response.json(
      { error: "이름을 2자 이상 입력해 주세요." },
      { status: 400 },
    );
  if (!/^01\d{8,9}$/.test(phone))
    return Response.json(
      { error: "휴대전화번호를 정확히 입력해 주세요." },
      { status: 400 },
    );
  if (birthDate && !isValidDateKey(birthDate))
    return Response.json(
      { error: "생년월일을 정확히 입력해 주세요." },
      { status: 400 },
    );
  if (!privacyAgreed)
    return Response.json(
      { error: "개인정보 수집 및 이용에 동의해 주세요." },
      { status: 400 },
    );

  const settings = await readScheduleSettings(),
    rule = ruleForDate(trainingDate, settings),
    count = await bookingCount(trainingDate),
    status = effectiveStatus(rule, count);
  if (["휴무", "교육없음", "접수마감"].includes(status))
    return Response.json(
      { error: "선택한 날짜는 현재 신청할 수 없습니다." },
      { status: 409 },
    );

  try {
    const id = await createApplication({
      trainingDate,
      name,
      phone,
      birthDate,
      isForeigner: body.isForeigner === true,
      request: requestText,
      capacity: rule.capacity,
    });
    if (!id)
      return Response.json(
        { error: "방금 정원이 마감되었습니다. 다른 날짜를 선택해 주세요." },
        { status: 409 },
      );
    return Response.json({ ok: true, id });
  } catch {
    return Response.json(
      { error: "예약 저장 중 문제가 발생했습니다. 전화로 문의해 주세요." },
      { status: 500 },
    );
  }
}
