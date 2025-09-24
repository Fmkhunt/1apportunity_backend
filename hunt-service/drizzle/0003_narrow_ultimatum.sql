CREATE TABLE IF NOT EXISTS "complete_task" (
	"id" uuid PRIMARY KEY NOT NULL,
	"hunt_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"reward" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "complete_task_hunt_id_task_id_user_id_unique" UNIQUE("hunt_id","task_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complete_task" ADD CONSTRAINT "complete_task_hunt_id_hunts_id_fk" FOREIGN KEY ("hunt_id") REFERENCES "hunts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complete_task" ADD CONSTRAINT "complete_task_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complete_task" ADD CONSTRAINT "complete_task_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
