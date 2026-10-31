"use client";

import { useState } from "react";

export default function CancelForm({ initialId }: { initialId: string }) {
  const [message, setMessage] = useState(""),
    [done, setDone] = useState(false),
    [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("취소 처리 중입니다…");
    try {
      const response = await fetch("/api/applications/cancel", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: form.get("id"), phone: form.get("phone") }),
        }),
        data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "취소하지 못했습니다.");
      setDone(true);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "취소하지 못했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (done)
    return (
      <div className="applicationSuccess" role="status">
        <span aria-hidden="true">✓</span>
        <h2>예약이 취소되었습니다.</h2>
        <p>다시 신청하려면 교육일정을 확인해 주세요.</p>
        <a className="button lime" href="/schedule">
          교육일정 보기
        </a>
      </div>
    );
  return (
    <form className="applicationForm" onSubmit={submit}>
      <label>
        <span>예약번호</span>
        <input name="id" defaultValue={initialId} required />
      </label>
      <label>
        <span>예약 시 입력한 휴대전화번호</span>
        <input name="phone" type="tel" inputMode="tel" required />
      </label>
      <button className="submitApplication" type="submit" disabled={saving}>
        {saving ? "취소 처리 중…" : "예약 취소하기"}
      </button>
      <p className="formStatus" role="status">
        {message}
      </p>
    </form>
  );
}
