CREATE TABLE `spot` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`notes` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `spot_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`spot_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`spot_id`) REFERENCES `spot`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `spot_photo` (
	`id` text PRIMARY KEY NOT NULL,
	`spot_id` text NOT NULL,
	`filename` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`spot_id`) REFERENCES `spot`(`id`) ON UPDATE no action ON DELETE cascade
);
