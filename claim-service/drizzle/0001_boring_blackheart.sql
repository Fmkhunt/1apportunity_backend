DROP TABLE "questions";--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "hunts" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "created_by" uuid;