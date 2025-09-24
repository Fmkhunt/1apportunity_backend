ALTER TABLE "complete_task" ADD COLUMN "claim_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complete_task" ADD CONSTRAINT "complete_task_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
