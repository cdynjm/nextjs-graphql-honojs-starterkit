ALTER TABLE `users` MODIFY COLUMN `id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` int;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3);--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3);