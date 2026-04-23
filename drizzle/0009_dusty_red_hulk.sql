PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_lure` (
	`id` text PRIMARY KEY NOT NULL,
	`lure_number` integer,
	`name` text NOT NULL,
	`brand` text,
	`type` text,
	`color` text,
	`weight` real,
	`size` text,
	`notes` text,
	`photo_path` text,
	`species` text,
	`running_depth` text,
	`water_type` text,
	`light_conditions` integer,
	`qr_coded` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_lure`("id", "lure_number", "name", "brand", "type", "color", "weight", "size", "notes", "photo_path", "species", "running_depth", "water_type", "light_conditions", "qr_coded", "created_at", "updated_at") SELECT "id", "lure_number", "name", "brand", "type", "color", "weight", "size", "notes", "photo_path", "species", "running_depth", "water_type", "light_conditions", "qr_coded", "created_at", "updated_at" FROM `lure`;--> statement-breakpoint
DROP TABLE `lure`;--> statement-breakpoint
ALTER TABLE `__new_lure` RENAME TO `lure`;--> statement-breakpoint
PRAGMA foreign_keys=ON;