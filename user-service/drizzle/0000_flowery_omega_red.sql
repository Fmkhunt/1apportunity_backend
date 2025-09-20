CREATE TABLE IF NOT EXISTS "admin" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(200) NOT NULL,
	"password" varchar(200) NOT NULL,
	"role" varchar(50) DEFAULT 'manager',
	"zone_id" uuid,
	"permissions" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_location" (
	"id" uuid PRIMARY KEY NOT NULL,
	"country" varchar(100) NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"currency" varchar(50) NOT NULL,
	"currency_sign" varchar(10) NOT NULL,
	"currency_short" varchar(10) NOT NULL,
	"map" varchar(50) NOT NULL,
	"payment_gateway" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"profile" varchar(255) DEFAULT '',
	"balance" integer DEFAULT 0,
	"referral_code" varchar(10) NOT NULL,
	"referral_by" varchar(10),
	"status" varchar DEFAULT 'pending',
	"last_task_at" jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zone" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"area" text,
	"service_location_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otp" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"phone" varchar(15) NOT NULL,
	"otp" integer NOT NULL,
	"expire_at" timestamp NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reffral" (
	"id" uuid PRIMARY KEY NOT NULL,
	"refer_by" uuid,
	"referred" uuid,
	"coin" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin" ADD CONSTRAINT "admin_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "zone"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_referral_by_users_referral_code_fk" FOREIGN KEY ("referral_by") REFERENCES "users"("referral_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zone" ADD CONSTRAINT "zone_service_location_id_service_location_id_fk" FOREIGN KEY ("service_location_id") REFERENCES "service_location"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "otp" ADD CONSTRAINT "otp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reffral" ADD CONSTRAINT "reffral_refer_by_users_id_fk" FOREIGN KEY ("refer_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reffral" ADD CONSTRAINT "reffral_referred_users_id_fk" FOREIGN KEY ("referred") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
