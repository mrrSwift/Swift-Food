CREATE TABLE `categories` (
	`id` varchar(32) NOT NULL,
	`restaurantId` varchar(32) NOT NULL,
	`name` varchar(80) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menuItems` (
	`id` varchar(32) NOT NULL,
	`restaurantId` varchar(32) NOT NULL,
	`categoryId` varchar(32),
	`title` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`ingredients` text NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`rating` decimal(3,1),
	`imageKey` varchar(512),
	`imageUrl` varchar(1024),
	`isAvailable` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menuItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` varchar(32) NOT NULL,
	`ownerId` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`bannerImageKey` varchar(512),
	`bannerImageUrl` varchar(1024),
	`address` text NOT NULL,
	`phone` varchar(64) NOT NULL,
	`hours` text NOT NULL,
	`socialLinks` text NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`),
	CONSTRAINT `restaurants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menuItems` ADD CONSTRAINT `menuItems_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menuItems` ADD CONSTRAINT `menuItems_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurants` ADD CONSTRAINT `restaurants_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `categories_restaurant_order_idx` ON `categories` (`restaurantId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `menu_items_restaurant_order_idx` ON `menuItems` (`restaurantId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `menu_items_category_idx` ON `menuItems` (`categoryId`);--> statement-breakpoint
CREATE INDEX `restaurants_owner_idx` ON `restaurants` (`ownerId`);