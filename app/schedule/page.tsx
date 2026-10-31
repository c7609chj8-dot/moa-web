/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */
import ScheduleCalendar from "./ScheduleCalendar";
import { readScheduleSettings } from "@/lib/schedule";
import { readSettings } from "@/lib/site-settings";
import { bookingCounts } from "@/lib/applications";
import MobileActions from "@/app/MobileActions";

export const metadata = {
  title: "교육일정 · 양산 건설업 기초안전보건교육",
  description:
    "한국안전교육의 평일·토요일 교육일정, 접수상태, 남은 자리, 교육비와 준비물을 확인하세요.",
  alternates: { canonical: "/schedule" },
};

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [schedule, settings, bookings] = await Promise.all([
    readScheduleSettings(),
    readSettings(),
    bookingCounts(),
  ]);
  return (
    <main className="schedulePage">
      <header>
        <a className="brand" href="/">
          <img
            src="/korea-safety-symbol.png"
            alt="한국안전교육 심볼"
          />
          <span>
            <b>한국안전교육</b>
            <small>KOREA SAFETY EDUCATION</small>
          </span>
        </a>
        <nav>
          <a href="/">홈</a>
          <a href="/schedule" aria-current="page">
            교육일정
          </a>
          <a href="/#facility">교육사진</a>
          <a href="/#location">오시는 길</a>
        </nav>
        <a className="pill" href="/">
          홈페이지
        </a>
      </header>
      <div className="scheduleIntro">
        <label>SCHEDULE</label>
        <h1>교육일정 달력</h1>
        <p>날짜를 선택하면 교육시간과 접수 가능 여부를 확인할 수 있습니다.</p>
      </div>
      <ScheduleCalendar
        settings={schedule}
        phone={settings.phone}
        bookings={bookings}
      />
      <MobileActions phone={settings.phone} address={settings.address} />
    </main>
  );
}
