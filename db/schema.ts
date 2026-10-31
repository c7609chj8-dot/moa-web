// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  fee: text("fee").notNull().default("80,000원"),
  weekdaySchedule: text("weekday_schedule")
    .notNull()
    .default("월요일~금요일 13:00~17:00"),
  saturdaySchedule: text("saturday_schedule")
    .notNull()
    .default("토요일 예약제 09:00~13:00"),
  phone: text("phone").notNull().default("055-389-0302"),
  fax: text("fax").notNull().default("0504-006-2558"),
  address: text("address").notNull().default("경남 양산시 북정서길 22, 201호"),
  noticeTitle: text("notice_title")
    .notNull()
    .default("교육 신청 전 꼭 확인해 주세요"),
  noticeText: text("notice_text")
    .notNull()
    .default("교육 당일 본인 확인을 위해 신분증을 반드시 지참해 주세요."),
  noticeEnabled: integer("notice_enabled").notNull().default(1),
  faqEnabled: integer("faq_enabled").notNull().default(1),
  homepageJson: text("homepage_json").notNull().default("{}"),
  popupJson: text("popup_json").notNull().default("{}"),
  faqsJson: text("faqs_json").notNull().default("[]"),
  resourcesJson: text("resources_json").notNull().default("[]"),
  relatedSitesJson: text("related_sites_json").notNull().default("[]"),
  photosJson: text("photos_json").notNull().default("[]"),
  instructorsJson: text("instructors_json").notNull().default("[]"),
  scheduleRulesJson: text("schedule_rules_json").notNull().default("{}"),
  scheduleExceptionsJson: text("schedule_exceptions_json")
    .notNull()
    .default("[]"),
});

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  trainingDate: text("training_date").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  birthDate: text("birth_date").notNull().default(""),
  isForeigner: integer("is_foreigner").notNull().default(0),
  request: text("request").notNull().default(""),
  status: text("status").notNull().default("확인대기"),
  paymentStatus: text("payment_status").notNull().default("미결제"),
  attendanceStatus: text("attendance_status").notNull().default("미처리"),
  memo: text("memo").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
