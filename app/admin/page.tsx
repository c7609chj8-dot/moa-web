import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { readSettings } from "@/lib/site-settings";
import { readScheduleSettings } from "@/lib/schedule";
import AdminForm from "./AdminForm";
import ScheduleAdmin from "./ScheduleAdmin";
import ApplicantAdmin from "./ApplicantAdmin";
import AdminWorkspace from "./AdminWorkspace";
import {
  applicationSummary,
  koreaDateKey,
  listApplications,
} from "@/lib/applications";
import {
  effectiveStatus,
  remainingSeats,
  ruleForDate,
} from "@/lib/schedule-types";

export const dynamic = "force-dynamic";
const ADMIN = "c7609chj8@gmail.com";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (user.email.toLowerCase() !== ADMIN)
    return (
      <main className="adminShell">
        <div className="adminCard">
          <h1>접근 권한이 없습니다</h1>
          <p>등록된 관리자 계정으로 로그인해 주세요.</p>
          <a href={chatGPTSignOutPath("/admin")}>다른 계정으로 로그인</a>
        </div>
      </main>
    );

  const [settings, schedule, applications, summary] = await Promise.all([
    readSettings(),
    readScheduleSettings(),
    listApplications("month").catch(() => []),
    applicationSummary(),
  ]);
  const todayRule = ruleForDate(koreaDateKey(), schedule),
    todayStatus = effectiveStatus(todayRule, summary.today),
    dashboard = {
      ...summary,
      remaining: ["휴무", "교육없음", "접수마감"].includes(todayStatus)
        ? 0
        : remainingSeats(todayRule, summary.today),
    };
  return (
    <main className="adminShell">
      <div className="adminTop">
        <div>
          <label>ADMIN</label>
          <h1>홈페이지 관리</h1>
          <p>{user.displayName} 관리자님, 내용을 수정하고 저장하세요.</p>
        </div>
        <div>
          <a href="/schedule" target="_blank">
            교육일정 보기
          </a>
          <a href="/" target="_blank">
            홈페이지 보기
          </a>
          <a href={chatGPTSignOutPath("/")}>로그아웃</a>
        </div>
      </div>
      <AdminWorkspace
        applicants={
          <ApplicantAdmin initial={applications} summary={dashboard} />
        }
        schedule={<ScheduleAdmin initial={schedule} />}
        content={<AdminForm initial={settings} />}
      />
      <div className="adminHelp">
        <b>사용 방법</b>
        <ol>
          <li>바꾸려는 내용을 입력합니다.</li>
          <li>‘변경사항 저장’을 누릅니다.</li>
          <li>홈페이지 보기에서 확인합니다.</li>
        </ol>
      </div>
    </main>
  );
}
