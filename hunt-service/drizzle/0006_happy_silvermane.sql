ALTER TABLE "users" ADD COLUMN "token" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_task_at";