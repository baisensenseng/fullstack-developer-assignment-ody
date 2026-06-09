ALTER TABLE "order_items" ADD COLUMN "item_name" varchar(160) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "line_total_cents" integer DEFAULT 0 NOT NULL;