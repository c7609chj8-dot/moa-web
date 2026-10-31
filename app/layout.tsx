import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./admin.css";
import "./resources.css";
import "./upload.css";
import "./logo.css";
import "./instructors.css";
import "./schedule.css";
import "./applications.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://korea-safety-education.c7609chj8.chatgpt.site"),
  title: {
    default: "한국안전교육 | 양산 건설업 기초안전보건교육",
    template: "%s | 한국안전교육",
  },
  description:
    "양산·부산·경남 건설업 기초안전보건교육. 평일 13시, 토요일 예약제 교육일정·교육비·준비물·온라인 신청·길찾기 안내.",
  keywords: [
    "양산 건설업 기초안전보건교육",
    "양산 건설기초안전교육",
    "부산 건설기초안전교육",
    "경남 건설기초안전교육",
    "건설기초안전교육 당일교육",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "한국안전교육",
    title: "한국안전교육 | 양산 건설업 기초안전보건교육",
    description:
      "교육일정, 교육비, 준비물, 남은 자리와 온라인 예약을 한 번에 확인하세요.",
    url: "/",
    images: [
      {
        url: "/korea-safety-symbol.png",
        alt: "한국안전교육",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "한국안전교육 | 건설업 기초안전보건교육",
    description: "양산·부산·경남 교육일정과 온라인 신청 안내",
    images: ["/korea-safety-symbol.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/korea-safety-symbol.png",
    shortcut: "/korea-safety-symbol.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e6b45",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
