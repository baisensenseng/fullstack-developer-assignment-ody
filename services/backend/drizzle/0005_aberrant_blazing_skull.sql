ALTER TABLE "ordering_settings" ADD COLUMN "business_name" varchar(160) DEFAULT 'Ody Bistro' NOT NULL;--> statement-breakpoint
ALTER TABLE "ordering_settings" ADD COLUMN "timezone" varchar(80) DEFAULT 'America/New_York' NOT NULL;--> statement-breakpoint
ALTER TABLE "ordering_settings" ADD COLUMN "currency" varchar(3) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "ordering_settings" ADD COLUMN "new_order_alerts" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "ordering_settings" ADD COLUMN "low_stock_alerts" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "ordering_settings" ADD COLUMN "daily_digest" boolean DEFAULT false NOT NULL;