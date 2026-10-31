"use client";

import { useEffect, useMemo, useState } from "react";
import type { ScheduleSettings } from "@/lib/schedule-types";
import { effectiveStatus, ruleForDate } from "@/lib/schedule-types";
import { remainingSeats } from "@/lib/schedule-types";

const weekNames = ["일", "월", "화", "수", "목", "금", "토"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function statusClass(status: string) {
  if (status === "접수가능") return "available";
  if (status === "예약가능") return "reservation";
  if (status === "마감임박") return "closing";
  if (status === "접수마감") return "closed";
  return "off";
}

export default function ScheduleCalendar({
  settings,
  phone,
  bookings,
}: {
  settings: ScheduleSettings;
  phone: string;
  bookings: Record<string, number>;
}) {
  const [view, setView] = useState<{ year: number; month: number } | null>(
      null,
    ),
    [today, setToday] = useState(""),
    [selected, setSelected] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date(),
        key = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
      setView({ year: now.getFullYear(), month: now.getMonth() });
      setToday(key);
      setSelected(key);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const days = useMemo(() => {
    if (!view) return [];
    const first = new Date(view.year, view.month, 1).getDay(),
      count = new Date(view.year, view.month + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - first + 1;
      return day >= 1 && day <= count ? day : null;
    });
  }, [view]);

  if (!view)
    return (
      <div className="calendarLoading">현재 달력을 불러오는 중입니다.</div>
    );

  const currentView = view,
    selectedRule = ruleForDate(selected, settings),
    selectedCount = bookings[selected] ?? 0,
    selectedStatus =
      today && selected < today
        ? "접수마감"
        : effectiveStatus(selectedRule, selectedCount),
    selectedRemaining = remainingSeats(selectedRule, selectedCount),
    [sy, sm, sd] = selected.split("-").map(Number),
    selectedWeekday = weekNames[new Date(Date.UTC(sy, sm - 1, sd)).getUTCDay()];

  function moveMonth(amount: number) {
    const target = new Date(currentView.year, currentView.month + amount, 1),
      next = { year: target.getFullYear(), month: target.getMonth() };
    setView(next);
    setSelected(dateKey(next.year, next.month, 1));
  }

  function moveToday() {
    const now = new Date(),
      key = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
    setView({ year: now.getFullYear(), month: now.getMonth() });
    setToday(key);
    setSelected(key);
  }

  return (
    <div className="calendarLayout">
      <section id="calendar" className="calendarPanel" aria-label="월간 교육일정">
        <div className="calendarToolbar">
          <h1>
            {view.year}년 {view.month + 1}월 교육일정
          </h1>
          <div>
            <button type="button" onClick={() => moveMonth(-1)}>
              ‹ 이전달
            </button>
            <button type="button" onClick={moveToday}>
              오늘
            </button>
            <button type="button" onClick={() => moveMonth(1)}>
              다음달 ›
            </button>
          </div>
        </div>
        <div className="calendarWeek" aria-hidden="true">
          {weekNames.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
        <div className="calendarGrid">
          {days.map((day, index) => {
            if (!day)
              return <span className="emptyDay" key={`empty-${index}`} />;
            const key = dateKey(view.year, view.month, day),
              rule = ruleForDate(key, settings),
              count = bookings[key] ?? 0,
              status =
                today && key < today
                  ? "접수마감"
                  : effectiveStatus(rule, count),
              time = rule.startTime
                ? `${rule.startTime.slice(0, 2)}~${rule.endTime.slice(0, 2)}시`
                : status;
            return (
              <button
                type="button"
                className={`calendarDay ${key === today ? "today" : ""} ${key === selected ? "selected" : ""}`}
                aria-label={`${view.year}년 ${view.month + 1}월 ${day}일 ${status}`}
                aria-pressed={key === selected}
                onClick={() => setSelected(key)}
                key={key}
              >
                <span className="dayNumber">
                  {day} {key === today && <small>오늘</small>}
                </span>
                <span className="dayTime">{time}</span>
                <span className={`statusTag ${statusClass(status)}`}>
                  {status}
                </span>
              </button>
            );
          })}
        </div>
        <div className="calendarLegend" aria-label="일정 상태 안내">
          {["접수가능", "예약가능", "마감임박", "접수마감", "휴무"].map(
            (status) => (
              <span key={status} className={statusClass(status)}>
                {status}
              </span>
            ),
          )}
        </div>
      </section>

      <aside className="scheduleDetail" aria-live="polite">
        <small>선택 날짜 상세정보</small>
        <h2>
          {sy}년 {sm}월 {sd}일 {selectedWeekday}요일
        </h2>
        <span className={`detailStatus ${statusClass(selectedStatus)}`}>
          {selectedStatus}
        </span>
        <dl>
          <div>
            <dt>교육과정</dt>
            <dd>{selectedRule.course}</dd>
          </div>
          <div>
            <dt>교육시간</dt>
            <dd>
              {selectedRule.startTime
                ? `${selectedRule.startTime} ~ ${selectedRule.endTime}`
                : "교육 없음"}
            </dd>
          </div>
          <div>
            <dt>접수상태</dt>
            <dd>{selectedStatus}</dd>
          </div>
          <div>
            <dt>정원</dt>
            <dd>
              {selectedRule.capacity > 0
                ? `${selectedRule.capacity}명`
                : "해당 없음"}
            </dd>
          </div>
          <div>
            <dt>남은 자리</dt>
            <dd>
              {selectedRule.capacity > 0 ? `${selectedRemaining}명` : "해당 없음"}
            </dd>
          </div>
          <div>
            <dt>준비물</dt>
            <dd>{selectedRule.supplies || "해당 없음"}</dd>
          </div>
          <div>
            <dt>교육비</dt>
            <dd>{selectedRule.fee || "해당 없음"}</dd>
          </div>
          <div>
            <dt>안내</dt>
            <dd>{selectedRule.note || "별도 안내 없음"}</dd>
          </div>
        </dl>
        <div className="detailActions">
          {!["휴무", "교육없음", "접수마감"].includes(selectedStatus) && (
            <a className="button lime" href={`/apply?date=${selected}`}>
              교육 신청
            </a>
          )}
          <a
            className="button detailCall"
            href={`tel:${phone.replace(/\D/g, "")}`}
          >
            전화 문의
          </a>
        </div>
      </aside>
    </div>
  );
}
