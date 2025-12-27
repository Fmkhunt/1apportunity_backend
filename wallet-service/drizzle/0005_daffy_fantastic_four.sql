CREATE TABLE IF NOT EXISTS "withdrawals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"coins" integer NOT NULL,
	"conversion_rate" numeric(10, 4) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"currency_amount" numeric(10, 4) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"processed_by" uuid,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_withdrawal_user_id" ON "withdrawals" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_withdrawal_status" ON "withdrawals" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_withdrawal_created_at" ON "withdrawals" ("created_at");