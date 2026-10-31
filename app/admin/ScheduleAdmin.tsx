"use client";

import { useState } from "react";
import {
  scheduleStatuses,
  type ScheduleException,
  type ScheduleRule,
  type ScheduleSettings,
} from "@/lib/schedule-types";

const ruleNames = {
  weekday: "월요일~금요일",
  saturday: "토요일",
  sunday: "일요일",
} as const;

function Field({
  label,
  value,
  onChange,
  type = "text",
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "wide" : ""}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function RuleFields({
  value,
  onChange,
  includeDate,
}: {
  value: ScheduleRule & { date?: string };
  onChange: (next: ScheduleRule & { date?: string }) => void;
  includeDate?: boolean;
}) {
  const set = <K extends keyof typeof value>(key: K, next: (typeof value)[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <div className="scheduleFields">
      {includeDate && (
        <Field
          label="교육 날짜"
          type="date"
          value={value.date ?? ""}
          onChange={(next) => set("date", next)}
        />
      )}
      <Field
        label="교육과정명"
        value={value.course}
        onChange={(next) => set("course", next)}
        wide={!includeDate}
      />
      <Field
        label="시작시간"
        type="time"
        value={value.startTime}
        onChange={(next) => set("startTime", next)}
      />
      <Field
        label="종료시간"
        type="time"
        value={value.endTime}
        onChange={(next) => set("endTime", next)}
      />
      <label>
        <span>접수상태</span>
        <select
          value={value.status}
          onChange={(event) =>
            set("status", event.target.value as ScheduleRule["status"])
          }
        >
          {scheduleStatuses.map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="교육비"
        value={value.fee}
        onChange={(next) => set("fee", next)}
      />
      <Field
        label="정원(명)"
        type="number"
        value={String(value.capacity)}
        onChange={(next) => set("capacity", Math.max(0, Number(next) || 0))}
      />
      <Field
        label="준비물"
        value={value.supplies}
        onChange={(next) => set("supplies", next)}
      />
      <label className="wide">
        <span>안내사항</span>
        <textarea
          value={value.note}
          onChange={(event) => set("note", event.target.value)}
        />
      </label>
      <div className="scheduleChecks">
        <label>
          <input
            type="checkbox"
            checked={value.closed}
            onChange={(event) => set("closed", event.target.checked)}
          />
          휴무
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.reservation}
            onChange={(event) => set("reservation", event.target.checked)}
          />
          예약제
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.registrationClosed}
            onChange={(event) =>
              set("registrationClosed", event.target.checked)
            }
          />
          접수마감
        </label>
      </div>
    </div>
  );
}

export default function ScheduleAdmin({
  initial,
}: {
  initial: ScheduleSettings;
}) {
  const [settings, setSettings] = useState(initial),
    [editing, setEditing] = useState<ScheduleException | null>(null),
    [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false);

  async function persist(next: ScheduleSettings, success: string) {
    setSaving(true);
    setMessage("저장 중…");
    try {
      const response = await fetch("/api/admin/schedule", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(next),
        }),
        data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "저장하지 못했습니다.");
      setSettings(next);
      setMessage(success);
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "저장하지 못했습니다.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  function newException() {
    const now = new Date(),
      date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setEditing({ ...settings.weekday, id: crypto.randomUUID(), date });
  }

  async function saveException() {
    if (!editing?.date) {
      setMessage("교육 날짜를 선택해 주세요.");
      return;
    }
    const others = settings.exceptions.filter(
        (item) => item.id !== editing.id && item.date !== editing.date,
      ),
      next = {
        ...settings,
        exceptions: [...others, editing].sort((a, b) =>
          a.date.localeCompare(b.date),
        ),
      };
    if (await persist(next, "날짜별 일정이 저장되어 홈페이지에 반영됩니다."))
      setEditing(null);
  }

  async function deleteException(item: ScheduleException) {
    if (!window.confirm(`${item.date} 예외 일정을 삭제할까요?`)) return;
    const next = {
      ...settings,
      exceptions: settings.exceptions.filter((entry) => entry.id !== item.id),
    };
    if (await persist(next, "선택한 날짜별 일정이 삭제되었습니다."))
      setEditing((current) => (current?.id === item.id ? null : current));
  }

  return (
    <section className="scheduleAdmin">
      <h2>교육일정 관리</h2>
      <p className="adminHint">
        기본 반복 일정을 정하고, 휴무나 시간 변경이 있는 날짜만 예외 일정으로
        추가하세요.
      </p>
      <div className="ruleTabs">
        {(Object.keys(ruleNames) as Array<keyof typeof ruleNames>).map(
          (key) => (
            <article className="ruleCard" key={key}>
              <h3>{ruleNames[key]} 기본 일정</h3>
              <RuleFields
                value={settings[key]}
                onChange={(next) =>
                  setSettings((current) => ({ ...current, [key]: next }))
                }
              />
            </article>
          ),
        )}
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() =>
          persist(settings, "기본 반복 일정이 저장되어 홈페이지에 반영됩니다.")
        }
      >
        기본 반복 일정 저장
      </button>
      <div className="exceptionHead">
        <div>
          <h3>날짜별 예외 일정</h3>
          <p>공휴일·임시휴무·시간 변경·접수마감을 등록할 수 있습니다.</p>
        </div>
        <button type="button" onClick={newException} disabled={saving}>
          + 특정 날짜 일정 추가
        </button>
      </div>
      {editing && (
        <div className="exceptionEditor">
          <h3>
            {settings.exceptions.some((x) => x.id === editing.id)
              ? "일정 수정"
              : "새 일정 저장"}
          </h3>
          <RuleFields
            value={editing}
            includeDate
            onChange={(next) => setEditing(next as ScheduleException)}
          />
          <div className="detailActions">
            <button type="button" onClick={saveException} disabled={saving}>
              {settings.exceptions.some((x) => x.id === editing.id)
                ? "수정 내용 저장"
                : "새 일정 저장"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setEditing(null)}
            >
              취소
            </button>
          </div>
        </div>
      )}
      <div className="exceptionList">
        {settings.exceptions.length === 0 ? (
          <p>등록된 날짜별 예외 일정이 없습니다.</p>
        ) : (
          settings.exceptions.map((item) => (
            <div className="exceptionRow" key={item.id}>
              <strong>{item.date}</strong>
              <span>
                {item.course} · {item.startTime || "시간 없음"}
                {item.endTime ? `~${item.endTime}` : ""}
              </span>
              <b>{item.closed ? "휴무" : item.status}</b>
              <div className="detailActions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEditing(item)}
                  disabled={saving}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => deleteException(item)}
                  disabled={saving}
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="scheduleAdminStatus" role="status">
        {message}
      </p>
    </section>
  );
}
