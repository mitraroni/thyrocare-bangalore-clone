CREATE TABLE `footer_addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address_line_1` text NOT NULL,
	`address_line_2` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`postal_code` text NOT NULL,
	`country` text NOT NULL,
	`is_active` integer DEFAULT true,
	`display_order` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `footer_contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_type` text NOT NULL,
	`contact_value` text NOT NULL,
	`label` text NOT NULL,
	`is_active` integer DEFAULT true,
	`display_order` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
