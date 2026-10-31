export const scheduleStatuses = [
  "접수가능",
  "예약가능",
  "마감임박",
  "접수마감",
  "휴무",
  "교육없음",
] as const;

export type ScheduleStatus = (typeof scheduleStatuses)[number];

export type ScheduleRule = {
  course: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  fee: string;
  supplies: string;
  note: string;
  capacity: number;
  closed: boolean;
  reservation: boolean;
  registrationClosed: boolean;
};

export type ScheduleException = ScheduleRule & {
  id: string;
  date: string;
};

export type ScheduleSettings = {
  weekday: ScheduleRule;
  saturday: ScheduleRule;
  sunday: ScheduleRule;
  exceptions: ScheduleException[];
};

export function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number),
    date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function effectiveStatus(
  item: ScheduleRule,
  bookedCount = 0,
): ScheduleStatus {
  if (item.closed) return "휴무";
  if (item.registrationClosed) return "접수마감";
  if (item.capacity > 0 && bookedCount >= item.capacity) return "접수마감";
  if (
    item.capacity > 0 &&
    item.capacity - bookedCount > 0 &&
    item.capacity - bookedCount <= 5
  )
    return "마감임박";
  if (item.reservation && item.status === "접수가능") return "예약가능";
  return item.status;
}

export function remainingSeats(item: ScheduleRule, bookedCount = 0) {
  return Math.max(0, item.capacity - bookedCount);
}

export function ruleForDate(
  dateKey: string,
  settings: ScheduleSettings,
): ScheduleRule {
  const exception = settings.exceptions.find((item) => item.date === dateKey);
  if (exception) return exception;
  const [year, month, day] = dateKey.split("-").map(Number),
    weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0
    ? settings.sunday
    : weekday === 6
      ? settings.saturday
      : settings.weekday;
}
