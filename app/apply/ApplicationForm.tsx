"use client";

import { useState } from "react";
import { SMS_RECIPIENT } from "@/lib/contact";

export default function ApplicationForm({
  trainingDate,
  phone,
}: {
  trainingDate: string;
  phone: string;
}) {
  const [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false),
    [reservationId, setReservationId] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("예약을 저장하는 중입니다…");
    try {
      const response = await fetch("/api/applications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            trainingDate,
            name: form.get("name"),
            phone: form.get("phone"),
            birthDate: form.get("birthDate"),
            isForeigner: form.get("isForeigner") === "on",
            request: form.get("request"),
            privacyAgreed: form.get("privacyAgreed") === "on",
            website: form.get("website"),
          }),
        }),
        data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "예약하지 못했습니다.");
      setReservationId(data.id);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "예약하지 못했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (reservationId)
    return (
      <div className="applicationSuccess" role="status">
        <span aria-hidden="true">✓</span>
        <h2>교육 예약이 완료되었습니다.</h2>
        <p>교육 당일 신분증을 반드시 지참해 주세요.</p>
        <dl>
          <div>
            <dt>교육일</dt>
            <dd>{trainingDate}</dd>
          </div>
          <div>
            <dt>예약번호</dt>
            <dd>{reservationId}</dd>
          </div>
        </dl>
        <p className="successHint">
          예약번호는 예약 확인·취소에 필요하므로 보관해 주세요.
        </p>
        <div className="applyActions">
          <a className="button lime" href="/schedule">
            교육일정 보기
          </a>
          <a
            className="button backButton"
            href={`/cancel?id=${encodeURIComponent(reservationId)}`}
          >
            예약 취소
          </a>
        </div>
      </div>
    );

  const tel = phone.replace(/\D/g, ""),
    smsText = encodeURIComponent(
      `안녕하세요. 건설업 기초안전보건교육 문의드립니다.\n희망 교육일: ${trainingDate}`,
    );
  return (
    <form className="applicationForm" onSubmit={submit}>
      <h2>예약자 정보</h2>
      <div className="formGrid">
        <label>
          <span>이름 <b>필수</b></span>
          <input name="name" autoComplete="name" maxLength={40} required />
        </label>
        <label>
          <span>휴대전화번호 <b>필수</b></span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="010-0000-0000"
            maxLength={20}
            required
          />
        </label>
        <label>
          <span>생년월일 <small>선택</small></span>
          <input name="birthDate" type="date" />
        </label>
        <label className="checkField">
          <input name="isForeigner" type="checkbox" />
          외국인 교육생입니다
        </label>
        <label className="wide">
          <span>기타 요청사항 <small>선택</small></span>
          <textarea name="request" maxLength={500} />
        </label>
        <label className="privacyCheck wide">
          <input name="privacyAgreed" type="checkbox" required />
          <span>
            예약 확인을 위해 이름·휴대전화번호·선택 입력한 생년월일을
            수집·이용하는 데 동의합니다. 예약 관리 목적 외에는 사용하지
            않습니다. <b>필수</b>
          </span>
        </label>
        <label className="honeypot" aria-hidden="true">
          홈페이지
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="submitApplication" type="submit" disabled={saving}>
        {saving ? "예약 저장 중…" : "교육 예약 완료하기"}
      </button>
      <p className="formStatus" role="status">
        {message}
      </p>
      <div className="fallbackContact">
        온라인 예약이 어려우면{ " "}
        <a href={`tel:${tel}`}>전화</a> 또는{ " "}
        <a href={`sms:${SMS_RECIPIENT}?body=${smsText}`}>문자</a>로 문의해
        주세요.
      </div>
    </form>
  );
}
