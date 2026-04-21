CREATE TABLE `fish_catch` (`id` text PRIMARY KEY NOT NULL, `caught_at` integer NOT NULL, `species` text, `weight_g` real, `length_cm` real, `notes` text, `spot_id` text REFERENCES `spot`(`id`) ON DELETE set null, `lure_id` text REFERENCES `lure`(`id`) ON DELETE set null, `created_at` integer, `updated_at` integer);
--> statement-breakpoint
CREATE TABLE `catch_photo` (`id` text PRIMARY KEY NOT NULL, `catch_id` text NOT NULL, `filename` text NOT NULL, `sort_order` integer DEFAULT 0 NOT NULL, FOREIGN KEY (`catch_id`) REFERENCES `fish_catch`(`id`) ON DELETE cascade ON UPDATE no action);
