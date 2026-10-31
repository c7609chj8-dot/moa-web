import { env } from "cloudflare:workers";
export type ResourceItem = {
  id?: string;
  title: string;
  description: string;
  url: string;
  image: string;
};
export type LinkItem = { title: string; url: string };
export type PhotoItem = { id?: string; title: string; url: string };
export type InstructorItem = {
  id?: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  photo: string;
};
export type FaqItem = {
  id?: string;
  question: string;
  answer: string;
};
export type HomepageContent = {
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  aboutTitleLine1: string;
  aboutTitleLine2: string;
  aboutText1: string;
  aboutText2: string;
  contactTitle: string;
  contactText: string;
};
export type PopupSettings = {
  enabled: boolean;
  title: string;
  text: string;
};
export type SiteSettings = {
  fee: string;
  weekdaySchedule: string;
  saturdaySchedule: string;
  phone: string;
  fax: string;
  address: string;
  noticeTitle: string;
  noticeText: string;
  noticeEnabled: boolean;
  faqEnabled: boolean;
  homepage: HomepageContent;
  popup: PopupSettings;
  faqs: FaqItem[];
  resources: ResourceItem[];
  relatedSites: LinkItem[];
  photos: PhotoItem[];
  instructors: InstructorItem[];
};
const defaultPhotos = [
  {
    title: "교육장 전경",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "안전교육 강의",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "실습 중심 교육",
    url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=85",
  },
];
const defaultFaqs: FaqItem[] = [
  {
    question: "교육은 몇 시간인가요?",
    answer: "건설업 기초안전보건교육은 총 4시간 과정입니다.",
  },
  {
    question: "당일 접수 가능한가요?",
    answer:
      "잔여석이 있으면 가능하지만 마감될 수 있으므로 교육일정을 확인한 뒤 예약하거나 전화로 문의해 주세요.",
  },
  {
    question: "신분증이 꼭 필요한가요?",
    answer: "본인 확인을 위해 교육 당일 신분증을 반드시 지참해야 합니다.",
  },
  {
    question: "교육비는 얼마인가요?",
    answer: "현재 교육비는 80,000원이며 변경 시 홈페이지 공지로 안내합니다.",
  },
  {
    question: "토요일에도 교육하나요?",
    answer: "토요일은 09:00~13:00 예약제로 운영합니다.",
  },
  {
    question: "주차 가능한가요?",
    answer: "교육생을 위한 주차 공간을 이용할 수 있습니다.",
  },
  {
    question: "외국인도 교육을 받을 수 있나요?",
    answer:
      "가능합니다. 예약 시 외국인 여부를 표시하고 준비사항은 센터에 미리 문의해 주세요.",
  },
  {
    question: "교육에 늦게 도착하면 어떻게 되나요?",
    answer:
      "법정 교육시간을 충족해야 하므로 교육 시작 20분 전까지 도착해 주세요. 지각 시 입실이 제한될 수 있습니다.",
  },
  {
    question: "이수증은 언제 받나요?",
    answer: "교육을 정상적으로 이수하면 당일 발급됩니다.",
  },
  {
    question: "예약을 취소하려면 어떻게 하나요?",
    answer:
      "예약 완료 화면의 예약번호로 홈페이지에서 취소하거나 전화로 연락해 주세요.",
  },
];
export const defaults: SiteSettings = {
  fee: "80,000원",
  weekdaySchedule: "월요일~금요일 13:00~17:00",
  saturdaySchedule: "토요일 예약제 09:00~13:00",
  phone: "055-389-0302",
  fax: "0504-006-2558",
  address: "경남 양산시 북정서길 22, 201호",
  noticeTitle: "교육 신청 전 꼭 확인해 주세요",
  noticeText: "교육 당일 본인 확인을 위해 신분증을 반드시 지참해 주세요.",
  noticeEnabled: true,
  faqEnabled: true,
  homepage: {
    heroEyebrow: "양산 · 부산 · 경남 교육생을 위한 법정 안전교육",
    heroTitleLine1: "건설업 기초",
    heroTitleLine2: "안전보건교육",
    heroDescription:
      "평일 13:00~17:00 · 토요일 09:00~13:00 예약제\n교육비 {fee} · 신분증 필수 · 주차 가능 · 현장 접수 가능",
    aboutTitleLine1: "안전은 교육에서",
    aboutTitleLine2: "시작됩니다",
    aboutText1:
      "건설현장에 처음 들어가는 근로자가 반드시 알아야 할 핵심 안전수칙을 현장 사례 중심으로 전달합니다.",
    aboutText2: "접수부터 이수까지 친절하게 안내합니다.",
    contactTitle: "안전교육, 지금 편하게 상담하세요",
    contactText: "교육일정과 준비물을 친절하게 안내해 드립니다.",
  },
  popup: {
    enabled: false,
    title: "긴급 교육 안내",
    text: "변경된 교육일정이나 휴무 내용을 입력해 주세요.",
  },
  faqs: defaultFaqs,
  resources: [
    {
      title: "건설현장 주요 위험작업 안전자료",
      description: "안전보건공단 건설현장 위험작업 교육자료",
      url: "https://www.kosha.or.kr",
      image: "",
    },
    {
      title: "건설업 안전일터 조성지원 안내",
      description: "건설업 안전지원 사업 안내자료",
      url: "https://www.kosha.or.kr",
      image: "",
    },
  ],
  relatedSites: [
    { title: "고용노동부", url: "https://www.moel.go.kr" },
    { title: "안전보건공단", url: "https://www.kosha.or.kr" },
    { title: "국토교통부", url: "https://www.molit.go.kr" },
    { title: "국가법령정보센터", url: "https://www.law.go.kr" },
  ],
  photos: defaultPhotos,
  instructors: [],
};
function arr<T>(v: string | undefined, f: T[]) {
  try {
    const x = JSON.parse(v ?? "");
    return Array.isArray(x) ? x : f;
  } catch {
    return f;
  }
}
function object<T extends object>(v: string | undefined, fallback: T): T {
  try {
    const parsed = JSON.parse(v ?? "");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? { ...fallback, ...parsed }
      : fallback;
  } catch {
    return fallback;
  }
}
export async function readSettings(): Promise<SiteSettings> {
  try {
    const r = await env.DB.prepare(
      "SELECT fee,weekday_schedule,saturday_schedule,phone,fax,address,notice_title,notice_text,notice_enabled,faq_enabled,homepage_json,popup_json,faqs_json,resources_json,related_sites_json,photos_json,instructors_json FROM site_settings WHERE id=1",
    ).first<Record<string, string>>();
    if (!r) return defaults;
    return {
      fee: r.fee,
      weekdaySchedule: r.weekday_schedule,
      saturdaySchedule: r.saturday_schedule,
      phone: r.phone,
      fax: r.fax || defaults.fax,
      address: r.address,
      noticeTitle: r.notice_title,
      noticeText: r.notice_text,
      noticeEnabled: Number(r.notice_enabled) !== 0,
      faqEnabled: Number(r.faq_enabled) !== 0,
      homepage: object(r.homepage_json, defaults.homepage),
      popup: object(r.popup_json, defaults.popup),
      faqs:
        r.faqs_json && r.faqs_json !== "[]"
          ? arr(r.faqs_json, defaults.faqs)
          : defaults.faqs,
      resources: arr(r.resources_json, defaults.resources),
      relatedSites: arr(r.related_sites_json, defaults.relatedSites),
      photos: arr(r.photos_json, defaults.photos),
      instructors: arr(r.instructors_json, defaults.instructors),
    };
  } catch {
    return defaults;
  }
}
export async function writeSettings(s: SiteSettings) {
  return env.DB.prepare(
    "INSERT INTO site_settings (id,fee,weekday_schedule,saturday_schedule,phone,fax,address,notice_title,notice_text,notice_enabled,faq_enabled,homepage_json,popup_json,faqs_json,resources_json,related_sites_json,photos_json,instructors_json) VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET fee=excluded.fee,weekday_schedule=excluded.weekday_schedule,saturday_schedule=excluded.saturday_schedule,phone=excluded.phone,fax=excluded.fax,address=excluded.address,notice_title=excluded.notice_title,notice_text=excluded.notice_text,notice_enabled=excluded.notice_enabled,faq_enabled=excluded.faq_enabled,homepage_json=excluded.homepage_json,popup_json=excluded.popup_json,faqs_json=excluded.faqs_json,resources_json=excluded.resources_json,related_sites_json=excluded.related_sites_json,photos_json=excluded.photos_json,instructors_json=excluded.instructors_json",
  )
    .bind(
      s.fee,
      s.weekdaySchedule,
      s.saturdaySchedule,
      s.phone,
      s.fax,
      s.address,
      s.noticeTitle,
      s.noticeText,
      s.noticeEnabled ? 1 : 0,
      s.faqEnabled ? 1 : 0,
      JSON.stringify(s.homepage),
      JSON.stringify(s.popup),
      JSON.stringify(s.faqs),
      JSON.stringify(s.resources),
      JSON.stringify(s.relatedSites),
      JSON.stringify(s.photos),
      JSON.stringify(s.instructors),
    )
    .run();
}
