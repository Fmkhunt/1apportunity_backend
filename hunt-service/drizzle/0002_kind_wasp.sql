ALTER TABLE "hunts" RENAME COLUMN "admin_id" TO "zone_id";--> statement-breakpoint
ALTER TABLE "hunt_tasks" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "hunt_tasks" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "hunt_tasks" ADD COLUMN "updated_at" timestamp DEFAULT now();