ALTER TABLE `site_settings` ADD `notice_enabled` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `faq_enabled` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `homepage_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `popup_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `faqs_json` text DEFAULT '[]' NOT NULL;