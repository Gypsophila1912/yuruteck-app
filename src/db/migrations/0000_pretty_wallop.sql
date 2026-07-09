CREATE TABLE `test` (
	`id` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `test_id` PRIMARY KEY(`id`)
);
