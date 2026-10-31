import { getChatGPTUser } from "@/app/chatgpt-auth";
import { writeSettings, type SiteSettings } from "@/lib/site-settings";
const ADMIN = "c7609chj8@gmail.com";
async function allowed() {
  return (await getChatGPTUser())?.email.toLowerCase() === ADMIN;
}
const txt = (v: unknown, n = 500) =>
    String(v ?? "")
      .trim()
      .slice(0, n),
  url = (v: unknown) => {
    const x = txt(v, 1000);
    return /^https:\/\//i.test(x) ||
      /^\/api\/media\?key=(images|files)%2F[a-z0-9-]+\.(jpg|png|webp|gif|pdf|hwp|hwpx|doc|docx)$/i.test(x)
      ? x
      : "";
  },
  id = (v: unknown) => {
    const x = txt(v, 80);
    return /^[a-zA-Z0-9-]+$/.test(x) ? x : crypto.randomUUID();
  };
export async function POST(req: Request) {
  if (!(await allowed()))
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  const b = (await req.json()) as SiteSettings;
  const s: SiteSettings = {
    fee: txt(b.fee),
    weekdaySchedule: txt(b.weekdaySchedule),
    saturdaySchedule: txt(b.saturdaySchedule),
    phone: txt(b.phone),
    fax: txt(b.fax),
    address: txt(b.address),
    noticeTitle: txt(b.noticeTitle),
    noticeText: txt(b.noticeText),
    noticeEnabled: Boolean(b.noticeEnabled),
    faqEnabled: Boolean(b.faqEnabled),
    homepage: {
      heroEyebrow: txt(b.homepage?.heroEyebrow),
      heroTitleLine1: txt(b.homepage?.heroTitleLine1),
      heroTitleLine2: txt(b.homepage?.heroTitleLine2),
      heroDescription: txt(b.homepage?.heroDescription, 1000),
      aboutTitleLine1: txt(b.homepage?.aboutTitleLine1),
      aboutTitleLine2: txt(b.homepage?.aboutTitleLine2),
      aboutText1: txt(b.homepage?.aboutText1, 1000),
      aboutText2: txt(b.homepage?.aboutText2, 1000),
      contactTitle: txt(b.homepage?.contactTitle),
      contactText: txt(b.homepage?.contactText, 1000),
    },
    popup: {
      enabled: Boolean(b.popup?.enabled),
      title: txt(b.popup?.title),
      text: txt(b.popup?.text, 1000),
    },
    faqs: (b.faqs ?? [])
      .slice(0, 30)
      .map((x) => ({
        id: id(x.id),
        question: txt(x.question),
        answer: txt(x.answer, 1500),
      }))
      .filter((x) => x.question && x.answer),
    resources: (b.resources ?? [])
      .slice(0, 20)
      .map((x) => ({
        id: id(x.id),
        title: txt(x.title),
        description: txt(x.description),
        url: url(x.url),
        image: url(x.image),
      }))
      .filter((x) => x.title && x.url),
    relatedSites: (b.relatedSites ?? [])
      .slice(0, 20)
      .map((x) => ({ title: txt(x.title), url: url(x.url) }))
      .filter((x) => x.title && x.url),
    photos: (b.photos ?? [])
      .slice(0, 12)
      .map((x) => ({ id: id(x.id), title: txt(x.title), url: url(x.url) }))
      .filter((x) => x.title && x.url),
    instructors: (b.instructors ?? [])
      .slice(0, 12)
      .map((x) => ({
        id: id(x.id),
        name: txt(x.name),
        role: txt(x.role),
        specialty: txt(x.specialty),
        bio: txt(x.bio, 1000),
        photo: url(x.photo),
      }))
      .filter((x) => x.name),
  };
  if (
    !s.fee ||
    !s.phone ||
    !s.fax ||
    !s.address ||
    !s.homepage.heroTitleLine1 ||
    !s.homepage.heroTitleLine2
  )
    return Response.json(
      {
        error:
          "교육비, 전화번호, 팩스번호, 주소와 메인 제목은 반드시 입력해 주세요.",
      },
      { status: 400 },
    );
  await writeSettings(s);
  return Response.json({ ok: true });
}
