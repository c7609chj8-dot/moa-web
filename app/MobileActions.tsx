import { SMS_RECIPIENT } from "@/lib/contact";

export default function MobileActions({
  phone,
  address,
}: {
  phone: string;
  address: string;
}) {
  const tel = phone.replace(/\D/g, ""),
    smsText = encodeURIComponent(
      "안녕하세요. 건설업 기초안전보건교육 문의드립니다.",
    ),
    map = `https://map.naver.com/p/search/${encodeURIComponent(address)}`;
  return (
    <nav className="mobileActions" aria-label="모바일 빠른 메뉴">
      <a href={`tel:${tel}`}>
        <span aria-hidden="true">☎</span>전화
      </a>
      <a href={`sms:${SMS_RECIPIENT}?body=${smsText}`}>
        <span aria-hidden="true">✉</span>문자
      </a>
      <a href="/schedule">
        <span aria-hidden="true">▦</span>일정
      </a>
      <a href="/schedule#calendar">
        <span aria-hidden="true">✓</span>신청
      </a>
      <a href={map} target="_blank" rel="noreferrer">
        <span aria-hidden="true">●</span>길찾기
      </a>
    </nav>
  );
}
