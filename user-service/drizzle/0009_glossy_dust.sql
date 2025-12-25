ALTER TABLE "service_location" ADD COLUMN "coin_rate" numeric(10, 4) DEFAULT '0.0000' NOT NULL;--> statement-breakpoint
ALTER TABLE "service_location" ADD COLUMN "token_rate" numeric(10, 4) DEFAULT '0.0000' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "service_location_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_service_location_id_service_location_id_fk" FOREIGN KEY ("service_location_id") REFERENCES "service_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
