CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deactivated_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"fullName" varchar(100),
	"username" varchar(16),
	"deactivatedOn" timestamp DEFAULT now() NOT NULL,
	"usageDays" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fullName" varchar(100) NOT NULL,
	"username" varchar(16) NOT NULL,
	"privateKey" varchar,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdOn" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_login" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"token" varchar NOT NULL,
	"loggedIn" timestamp DEFAULT now() NOT NULL,
	"loggedOut" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_login" ADD CONSTRAINT "user_login_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "usernameIndex" ON "user" USING btree ("username");