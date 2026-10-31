ALTER TABLE `site_settings` ADD `schedule_rules_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `schedule_exceptions_json` text DEFAULT '[]' NOT NULL;