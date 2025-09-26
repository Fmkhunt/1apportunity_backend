CREATE INDEX IF NOT EXISTS "idx_user_id" ON "wallet" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_created_at" ON "wallet" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_type" ON "wallet" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "wallet" ("transaction_type");