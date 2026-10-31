ALTER TABLE `site_settings` ADD `resources_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `related_sites_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `photos_json` text DEFAULT '[]' NOT NULL;