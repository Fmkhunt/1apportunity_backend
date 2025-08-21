CREATE TABLE IF NOT EXISTS "hunt_claim" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "claim_id" uuid NOT NULL,
  "status" varchar(150) NOT NULL,
  "coins" integer,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "hunt_claim_user_id_claim_id_unique" UNIQUE("user_id", "claim_id")
);

ALTER TABLE "hunt_claim" ADD CONSTRAINT "hunt_claim_claim_id_claims_id_fk"
  FOREIGN KEY ("claim_id") REFERENCES "claims" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Note: The user_id foreign key reference is not added here since the users table
-- is in a different service. The application code will need to handle this constraint.