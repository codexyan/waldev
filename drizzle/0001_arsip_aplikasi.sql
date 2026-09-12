CREATE TABLE `app_faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_app_faqs_app` ON `app_faqs` (`app_id`);--> statement-breakpoint
CREATE TABLE `app_features` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_app_features_app` ON `app_features` (`app_id`);--> statement-breakpoint
CREATE TABLE `app_media` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`media_id` text NOT NULL,
	`caption` text,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_app_media_app` ON `app_media` (`app_id`);--> statement-breakpoint
CREATE TABLE `app_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`body` text NOT NULL,
	`version` text,
	`noted_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_app_notes_app_noted` ON `app_notes` (`app_id`,`noted_at`);--> statement-breakpoint
CREATE TABLE `app_technologies` (
	`app_id` text NOT NULL,
	`technology_id` text NOT NULL,
	PRIMARY KEY(`app_id`, `technology_id`),
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`technology_id`) REFERENCES `technologies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `apps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`tagline` text,
	`description_json` text,
	`description_html` text,
	`status` text DEFAULT 'building' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`app_url` text,
	`repo_url` text,
	`video_url` text,
	`cover_media_id` text,
	`started_at` integer,
	`released_at` integer,
	`retired_at` integer,
	`guide_json` text,
	`guide_html` text,
	`show_guide` integer DEFAULT false NOT NULL,
	`show_faq` integer DEFAULT false NOT NULL,
	`show_notes` integer DEFAULT true NOT NULL,
	`show_releases` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`cover_media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apps_slug_unique` ON `apps` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_apps_status` ON `apps` (`status`);--> statement-breakpoint
CREATE INDEX `idx_apps_published` ON `apps` (`is_published`);--> statement-breakpoint
ALTER TABLE `articles` ADD `app_id` text REFERENCES apps(id) ON DELETE set null;--> statement-breakpoint
CREATE INDEX `idx_articles_app` ON `articles` (`app_id`);