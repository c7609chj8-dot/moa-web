CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`training_date` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`birth_date` text DEFAULT '' NOT NULL,
	`is_foreigner` integer DEFAULT 0 NOT NULL,
	`request` text DEFAULT '' NOT NULL,
	`status` text DEFAULT '확인대기' NOT NULL,
	`payment_status` text DEFAULT '미결제' NOT NULL,
	`attendance_status` text DEFAULT '미처리' NOT NULL,
	`memo` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `fax` text DEFAULT '0504-006-2558' NOT NULL;