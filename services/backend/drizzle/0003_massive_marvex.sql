ALTER TABLE "menu_items" ADD COLUMN "description" varchar(500) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "sku" varchar(80) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "prep_station" varchar(80) DEFAULT 'Kitchen' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "dietary_tags" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;