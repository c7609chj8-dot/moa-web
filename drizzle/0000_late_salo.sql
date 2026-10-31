CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`fee` text DEFAULT '80,000원' NOT NULL,
	`weekday_schedule` text DEFAULT '월요일~금요일 13:00~17:00' NOT NULL,
	`saturday_schedule` text DEFAULT '토요일 예약제 09:00~13:00' NOT NULL,
	`phone` text DEFAULT '055-389-0302' NOT NULL,
	`address` text DEFAULT '경남 양산시 북정서길 22, 201호' NOT NULL,
	`notice_title` text DEFAULT '교육 신청 전 꼭 확인해 주세요' NOT NULL,
	`notice_text` text DEFAULT '교육 당일 본인 확인을 위해 신분증을 반드시 지참해 주세요.' NOT NULL
);
