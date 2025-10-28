CREATE TABLE IF NOT EXISTS "token_wallet" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" integer NOT NULL,
	"transaction_type" varchar NOT NULL,
	"clue_id" uuid,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_twallet_user_id" ON "token_wallet" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_twallet_created_at" ON "token_wallet" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_twallet_clue_id" ON "token_wallet" ("clue_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_twallet_transaction_type" ON "token_wallet" ("transaction_type");