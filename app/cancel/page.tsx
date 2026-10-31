import CancelForm from "./CancelForm";
import MobileActions from "@/app/MobileActions";
import { readSettings } from "@/lib/site-settings";

export const metadata = {
  title: "예약취소",
  description: "한국안전교육 건설업 기초안전보건교육 예약을 취소합니다.",
  alternates: { canonical: "/cancel" },
  robots: { index: false, follow: true },
};

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id = "" } = await searchParams;
  const settings = await readSettings();
  return (
    <main className="applyPage withMobileActions">
      <section className="applyCard">
        <label>RESERVATION CANCELLATION</label>
        <h1>예약 취소</h1>
        <p>예약번호와 휴대전화번호가 일치하면 즉시 취소됩니다.</p>
        <CancelForm initialId={id} />
        <a className="cancelBack" href="/schedule">
          ← 교육일정으로 돌아가기
        </a>
      </section>
      <MobileActions phone={settings.phone} address={settings.address} />
    </main>
  );
}
