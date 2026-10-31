import { env } from "cloudflare:workers";
import type { ScheduleSettings } from "./schedule-types";

export const defaultScheduleSettings: ScheduleSettings = {
  weekday: {
    course: "건설업 기초안전보건교육",
    startTime: "13:00",
    endTime: "17:00",
    status: "접수가능",
    fee: "80,000원",
    supplies: "신분증",
    note: "현장 등록 가능",
    capacity: 20,
    closed: false,
    reservation: false,
    registrationClosed: false,
  },
  saturday: {
    course: "건설업 기초안전보건교육",
    startTime: "09:00",
    endTime: "13:00",
    status: "예약가능",
    fee: "80,000원",
    supplies: "신분증",
    note: "사전 예약 후 방문해 주세요.",
    capacity: 20,
    closed: false,
    reservation: true,
    registrationClosed: false,
  },
  sunday: {
    course: "교육 없음",
    startTime: "",
    endTime: "",
    status: "휴무",
    fee: "",
    supplies: "",
    note: "일요일은 휴무입니다.",
    capacity: 0,
    closed: true,
    reservation: false,
    registrationClosed: true,
  },
  exceptions: [],
};

function parse<T>(value: string | undefined, fallback: T): T {
  try {
    const parsed = JSON.parse(value ?? "");
    return parsed && typeof parsed === "object" ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function readScheduleSettings(): Promise<ScheduleSettings> {
  try {
    const row = await env.DB.prepare(
      "SELECT schedule_rules_json,schedule_exceptions_json FROM site_settings WHERE id=1",
    ).first<Record<string, string>>();
    if (!row) return defaultScheduleSettings;
    const rules = parse<Partial<ScheduleSettings>>(
        row.schedule_rules_json,
        defaultScheduleSettings,
      ),
      exceptions = parse<ScheduleSettings["exceptions"]>(
        row.schedule_exceptions_json,
        [],
      );
    return {
      weekday: { ...defaultScheduleSettings.weekday, ...rules.weekday },
      saturday: { ...defaultScheduleSettings.saturday, ...rules.saturday },
      sunday: { ...defaultScheduleSettings.sunday, ...rules.sunday },
      exceptions: Array.isArray(exceptions)
        ? exceptions.map((item) => ({
            ...defaultScheduleSettings.weekday,
            ...item,
            capacity:
              Number.isInteger(item.capacity) && item.capacity >= 0
                ? item.capacity
                : defaultScheduleSettings.weekday.capacity,
          }))
        : [],
    };
  } catch {
    return defaultScheduleSettings;
  }
}

export async function writeScheduleSettings(settings: ScheduleSettings) {
  const rules = {
    weekday: settings.weekday,
    saturday: settings.saturday,
    sunday: settings.sunday,
  };
  return env.DB.prepare(
    "INSERT INTO site_settings (id,schedule_rules_json,schedule_exceptions_json) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET schedule_rules_json=excluded.schedule_rules_json,schedule_exceptions_json=excluded.schedule_exceptions_json",
  )
    .bind(JSON.stringify(rules), JSON.stringify(settings.exceptions))
    .run();
}
