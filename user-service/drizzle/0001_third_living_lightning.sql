ALTER TABLE "admin" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "created_by";--> statement-breakpoint
ALTER TABLE "otp" DROP COLUMN IF EXISTS "created_by";--> statement-breakpoint
ALTER TABLE "reffral" DROP COLUMN IF EXISTS "created_by";