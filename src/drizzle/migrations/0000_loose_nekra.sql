CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "book" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(500) NOT NULL,
	"author" varchar(100) NOT NULL,
	"summary" varchar,
	"rating" numeric,
	"pages" integer,
	"published_on" date,
	"created_by" uuid NOT NULL,
	"created_on" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookmark" (
	"user_id" uuid NOT NULL,
	"note_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"note_id" uuid NOT NULL,
	"comment" varchar NOT NULL,
	"created_on" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deactivated_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"fullname" varchar(100),
	"username" varchar(16),
	"deactivated_on" timestamp DEFAULT now() NOT NULL,
	"usage_days" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"note" varchar NOT NULL,
	"is_private" boolean DEFAULT true NOT NULL,
	"created_on" timestamp DEFAULT now() NOT NULL,
	"modified_on" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fullname" varchar(100) NOT NULL,
	"username" varchar(16) NOT NULL,
	"private_key" varchar,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"isPremiumUser" boolean DEFAULT false NOT NULL,
	"created_on" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_login" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar NOT NULL,
	"logged_in" timestamp DEFAULT now() NOT NULL,
	"logged_out" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "book" ADD CONSTRAINT "book_created_by_user_table_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user_table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_note_id_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."note"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_note_id_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."note"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_login" ADD CONSTRAINT "user_login_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_name_index" ON "book" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_author_index" ON "book" USING btree ("author");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bookmark_composite_index" ON "bookmark" USING btree ("user_id","note_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_user_index" ON "comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_note_index" ON "comment" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_user_index" ON "note" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_book_index" ON "note" USING btree ("book_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_index" ON "user_table" USING btree ("username");--> statement-breakpoint
CREATE VIEW "public"."comment_vw" AS (
  select
    c.*,
    u.fullname as "user",
    TO_CHAR(c.created_on,
    'DD') || ' ' || TO_CHAR(c.created_on,
    'Mon') as short_date
  from
    comment c,
    user_table u
  where
    c.user_id = u.id
);--> statement-breakpoint
CREATE VIEW "public"."note_vw" AS (
  select
    n.id,
    n.user_id,
    n.book_id,
    n.note,
    n.is_private,
    n.created_on,
    n.modified_on,
    u.fullname as user,
    b.name as book_name,
    b.author,
    (
    select
      COUNT(1)
    from
      comment c
    where
      c.note_id = n.id
        ) as comments,
    TO_CHAR(n.modified_on,
    'DD') || ' ' || TO_CHAR(n.modified_on,
    'Mon') as short_date
  from
    note n
  join user_table u on
    n.user_id = u.id
  join book b on
    n.book_id = b.id  
);--> statement-breakpoint
CREATE VIEW "public"."bookmark_vw" AS (
  select
    b.note_id ,
    b.user_id as "bookmark_user_id",
    nv.user_id as "note_user_id",
    nv.book_id,
    nv.note,
    nv.is_private,
    nv.created_on,
    nv.modified_on,
    nv."user",
    nv.book_name,
    nv.author,
    nv.comments,
    nv.short_date
  from
    note_vw nv,
    bookmark b
  where
    nv.id = b.note_id
);