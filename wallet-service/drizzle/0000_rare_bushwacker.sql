CREATE TABLE IF NOT EXISTS "wallet" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"coins" integer NOT NULL,
	"transaction_type" varchar NOT NULL,
	"type" varchar NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
