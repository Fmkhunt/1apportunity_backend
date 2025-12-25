CREATE TABLE IF NOT EXISTS "payment_transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) NOT NULL,
	"quantity" integer NOT NULL,
	"payment_type" varchar NOT NULL,
	"payment_gateway" varchar(50) NOT NULL,
	"gateway_order_id" varchar(255),
	"gateway_session_id" varchar(255),
	"status" varchar DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "token_wallet" ADD COLUMN "payment_transaction_id" uuid;--> statement-breakpoint
ALTER TABLE "wallet" ADD COLUMN "payment_transaction_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_user_id" ON "payment_transactions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_gateway_order_id" ON "payment_transactions" ("gateway_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_gateway_session_id" ON "payment_transactions" ("gateway_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_status" ON "payment_transactions" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_created_at" ON "payment_transactions" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_twallet_payment_transaction_id" ON "token_wallet" ("payment_transaction_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_wallet_payment_transaction_id" ON "wallet" ("payment_transaction_id");