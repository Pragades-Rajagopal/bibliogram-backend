CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grams_posted" integer,
	"books_seeded" integer
);
--> statement-breakpoint
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
	"gram_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gram_id" uuid NOT NULL,
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
CREATE TABLE IF NOT EXISTS "gram" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"gram" varchar NOT NULL,
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
CREATE TABLE IF NOT EXISTS "user_stats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"grams_count" integer,
	"wishlist" integer,
	"completed_books" integer
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
 ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_gram_id_gram_id_fk" FOREIGN KEY ("gram_id") REFERENCES "public"."gram"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "comment" ADD CONSTRAINT "comment_gram_id_gram_id_fk" FOREIGN KEY ("gram_id") REFERENCES "public"."gram"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gram" ADD CONSTRAINT "gram_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gram" ADD CONSTRAINT "gram_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;
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
DO $$ BEGIN
 ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_user_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_table"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_name_index" ON "book" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_author_index" ON "book" USING btree ("author");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bookmark_composite_index" ON "bookmark" USING btree ("user_id","gram_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_user_index" ON "comment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_gram_index" ON "comment" USING btree ("gram_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gram_user_index" ON "gram" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gram_book_index" ON "gram" USING btree ("book_id");--> statement-breakpoint
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
CREATE VIEW "public"."gram_vw" AS (
  select
    g.id,
    g.user_id,
    g.book_id,
    g.gram,
    g.is_private,
    g.created_on,
    g.modified_on,
    u.fullname as user,
    b.name as book_name,
    b.author,
    (
    select
      COUNT(1)
    from
      comment c
    where
      c.gram_id = g.id
        ) as comments,
    TO_CHAR(g.modified_on,
    'DD') || ' ' || TO_CHAR(g.modified_on,
    'Mon') as short_date
  from
    gram g
  join user_table u on
    g.user_id = u.id
  join book b on
    g.book_id = b.id  
);--> statement-breakpoint
CREATE VIEW "public"."bookmark_vw" AS (
  select
    b.gram_id ,
    b.user_id as "bookmark_user_id",
    gv.user_id as "gram_user_id",
    gv.book_id,
    gv.gram,
    gv.is_private,
    gv.created_on,
    gv.modified_on,
    gv."user",
    gv.book_name,
    gv.author,
    gv.comments,
    gv.short_date
  from
    gram_vw gv,
    bookmark b
  where
    gv.id = b.gram_id
);