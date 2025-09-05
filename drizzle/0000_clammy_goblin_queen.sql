CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`fish_model_id` text,
	`status` text DEFAULT 'creating' NOT NULL,
	`audio_path` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `tts_history` (
	`id` text PRIMARY KEY NOT NULL,
	`model_id` text,
	`text` text NOT NULL,
	`audio_path` text NOT NULL,
	`audio_format` text DEFAULT 'mp3' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE cascade
);
