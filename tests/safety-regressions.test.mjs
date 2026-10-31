import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("prevents reservations from exceeding the configured capacity", async () => {
  const applications = await source("lib/applications.ts");
  assert.match(applications, /INSERT INTO applications[\s\S]+SELECT COUNT\(\*\)/);
  assert.match(applications, /status<>'취소'/);
  assert.match(applications, /result\.meta\.changes \? id : null/);
});

test("validates uploaded file contents and requires the administrator", async () => {
  const media = await source("app/api/media/route.ts");
  assert.match(media, /getChatGPTUser/);
  assert.match(media, /hasSignature/);
  assert.match(media, /파일 형식과 실제 내용이 일치하지 않습니다/);
  assert.match(media, /customMetadata/);
});

test("treats past dates and closed dates as unavailable", async () => {
  const applyPage = await source("app/apply/page.tsx");
  assert.match(applyPage, /date < koreaDateKey\(\)/);
  assert.match(applyPage, /접수마감/);
});

test("routes hidden SMS links to the configured mobile number", async () => {
  const [contact, home, mobile] = await Promise.all([
    source("lib/contact.ts"),
    source("app/page.tsx"),
    source("app/MobileActions.tsx"),
  ]);
  assert.match(contact, /01072592558/);
  assert.match(home, /sms:\$\{SMS_RECIPIENT\}/);
  assert.match(mobile, /sms:\$\{SMS_RECIPIENT\}/);
  assert.doesNotMatch(home, />\s*010-?7259-?2558\s*</);
});
