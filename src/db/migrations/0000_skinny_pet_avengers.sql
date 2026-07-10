CREATE TABLE `articles` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`event_id` varchar(191) NOT NULL,
	`provider_id` varchar(191) NOT NULL,
	`title` varchar(512) NOT NULL,
	`url` varchar(768) NOT NULL,
	`content_type` enum('ARTICLE','SLIDE') NOT NULL,
	`published_at` datetime NOT NULL,
	`is_presenter` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_url_unique` UNIQUE(`url`),
	CONSTRAINT `articles_user_event_unique` UNIQUE(`user_id`,`event_id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`start_at` datetime NOT NULL,
	`end_at` datetime NOT NULL,
	`presentation_order_json` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `point_logs` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`event_id` varchar(191) NOT NULL,
	`article_id` varchar(191),
	`type` enum('ARTICLE','PRESENTATION','MANUAL') NOT NULL,
	`point` int NOT NULL DEFAULT 1,
	`reason` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `point_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`icon_url` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_provider_accounts` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`provider_id` varchar(191) NOT NULL,
	`rss_url` varchar(512) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_provider_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_provider_accounts_user_provider_idx` UNIQUE(`user_id`,`provider_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL,
	`discord_id` varchar(191) NOT NULL,
	`username` varchar(191) NOT NULL,
	`display_name` varchar(191) NOT NULL,
	`avatar_url` varchar(512),
	`role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_discord_id_idx` UNIQUE(`discord_id`)
);
--> statement-breakpoint
CREATE INDEX `articles_event_id_idx` ON `articles` (`event_id`);--> statement-breakpoint
CREATE INDEX `articles_published_at_idx` ON `articles` (`published_at`);--> statement-breakpoint
CREATE INDEX `articles_provider_id_idx` ON `articles` (`provider_id`);--> statement-breakpoint
CREATE INDEX `articles_user_id_idx` ON `articles` (`user_id`);--> statement-breakpoint
CREATE INDEX `point_logs_user_id_idx` ON `point_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `point_logs_event_id_idx` ON `point_logs` (`event_id`);