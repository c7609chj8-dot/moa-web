"use client";

import { useState } from "react";

export default function ShareButton() {
  const [label, setLabel] = useState("홈페이지 공유");
  async function share() {
    const data = {
      title: "한국안전교육 | 건설업 기초안전보건교육",
      text: "양산·부산·경남 건설업 기초안전보건교육 일정과 신청 안내",
      url: window.location.origin,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setLabel("주소 복사 완료 ✓");
        window.setTimeout(() => setLabel("홈페이지 공유"), 2000);
      }
    } catch {
      setLabel("공유가 취소되었습니다");
      window.setTimeout(() => setLabel("홈페이지 공유"), 2000);
    }
  }
  return (
    <button className="shareButton" type="button" onClick={share}>
      {label}
    </button>
  );
}
