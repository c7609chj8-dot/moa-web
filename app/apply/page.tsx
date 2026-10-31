import { readScheduleSettings } from "@/lib/schedule";
import {
  effectiveStatus,
  isValidDateKey,
  ruleForDate,
} from "@/lib/schedule-types";
import { readSettings } from "@/lib/site-settings";
import { bookingCount, koreaDateKey } from "@/lib/applications";
import { remainingSeats } from "@/lib/schedule-types";
import ApplicationForm from "./ApplicationForm";
import MobileActions from "@/app/MobileActions";

export const metadata = {
  title: "교육신청",
  description: "양산 건설업 기초안전보건교육 날짜를 선택하고 온라인으로 예약하세요.",
  alternates: { canonical: "/apply" },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams,
    date = params.date ?? "",
    [schedule, settings] = await Promise.all([
      readScheduleSettings(),
      readSettings(),
    ]);

  if (!isValidDateKey(date))
    return (
      <main className="applyPage">
        <section className="applyCard">
          <h1>교육일정을 먼저 선택해 주세요</h1>
          <a className="button lime" href="/schedule">
            교육일정 보기
          </a>
        </section>
      </main>
    );

  const rule = ruleForDate(date, schedule),
    count = await bookingCount(date),
    status = effectiveStatus(rule, count),
    remaining = remainingSeats(rule, count),
    [year, month, day] = date.split("-").map(Number),
    unavailable =
      date < koreaDateKey() ||
      ["휴무", "교육없음", "접수마감"].includes(status);

  return (
    <main className="applyPage withMobileActions">
      <section className="applyCard">
        <label>EDUCATION APPLICATION</label>
        <h1>교육 신청</h1>
        <p>선택한 날짜가 자동으로 입력되었습니다.</p>
        <dl>
          <div>
            <dt>선택 날짜</dt>
            <dd>
              {year}년 {month}월 {day}일
            </dd>
          </div>
          <div>
            <dt>교육과정</dt>
            <dd>{rule.course}</dd>
          </div>
          <div>
            <dt>교육시간</dt>
            <dd>
              {rule.startTime} ~ {rule.endTime}
            </dd>
          </div>
          <div>
            <dt>접수상태</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt>남은 자리</dt>
            <dd>{rule.capacity > 0 ? `${remaining}명` : "전화 문의"}</dd>
          </div>
          <div>
            <dt>교육비</dt>
            <dd>{rule.fee}</dd>
          </div>
          <div>
            <dt>준비물</dt>
            <dd>{rule.supplies}</dd>
          </div>
        </dl>
        {unavailable ? (
          <div className="applyUnavailable">
            <h2>현재 신청할 수 없는 날짜입니다.</h2>
            <p>다른 날짜를 선택하거나 전화로 문의해 주세요.</p>
            <div className="applyActions">
              <a className="button lime" href="/schedule">
                날짜 다시 선택
              </a>
              <a
                className="button detailCall"
                href={`tel:${settings.phone.replace(/\D/g, "")}`}
              >
                전화 문의
              </a>
            </div>
          </div>
        ) : (
          <ApplicationForm trainingDate={date} phone={settings.phone} />
        )}
      </section>
      <MobileActions phone={settings.phone} address={settings.address} />
    </main>
  );
}
