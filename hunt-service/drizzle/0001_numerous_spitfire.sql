CREATE TABLE IF NOT EXISTS "clue_tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"clue_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "clue_tasks_clue_id_task_id_unique" UNIQUE("clue_id","task_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clues" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hunt_tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"hunt_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	CONSTRAINT "hunt_tasks_hunt_id_task_id_unique" UNIQUE("hunt_id","task_id")
);
--> statement-breakpoint
ALTER TABLE "hunts" DROP CONSTRAINT "hunts_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "hunts" DROP CONSTRAINT "hunts_claim_id_claims_id_fk";
--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "hunt_claim" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "hunts" ADD COLUMN "admin_id" uuid;--> statement-breakpoint
ALTER TABLE "hunts" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "claim_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "hunt_claim" DROP COLUMN IF EXISTS "coins";--> statement-breakpoint
ALTER TABLE "hunts" DROP COLUMN IF EXISTS "task_id";--> statement-breakpoint
ALTER TABLE "hunts" DROP COLUMN IF EXISTS "claim_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clue_tasks" ADD CONSTRAINT "clue_tasks_clue_id_clues_id_fk" FOREIGN KEY ("clue_id") REFERENCES "clues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clue_tasks" ADD CONSTRAINT "clue_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hunt_tasks" ADD CONSTRAINT "hunt_tasks_hunt_id_hunts_id_fk" FOREIGN KEY ("hunt_id") REFERENCES "hunts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hunt_tasks" ADD CONSTRAINT "hunt_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
