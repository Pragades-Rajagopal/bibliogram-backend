import { relations, sql } from "drizzle-orm";
import {
  uniqueIndex,
  integer,
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
  date,
  index,
  boolean,
  pgView,
  text,
} from "drizzle-orm/pg-core";

export const UserStatus = pgEnum("user_status", ["active", "inactive"]);
export const UserRole = pgEnum("user_role", ["user", "admin"]);

export const User = pgTable(
  "user_table",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullname: varchar("fullname", { length: 100 }).notNull(),
    username: varchar("username", { length: 16 }).notNull(),
    privateKey: varchar("private_key"),
    status: UserStatus("status").notNull().default("active"),
    role: UserRole("role").notNull().default("user"),
    createdOn: timestamp("created_on").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("username_index").on(table.username)]
);

export const UserLogin = pgTable("user_login", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => User.id)
    .notNull(),
  token: varchar("token").notNull(),
  loggedIn: timestamp("logged_in").notNull().defaultNow(),
  loggedOut: timestamp("logged_out"),
});

export const DeactivatedUser = pgTable("deactivated_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  fullname: varchar("fullname", { length: 100 }),
  username: varchar("username", { length: 16 }),
  deactivatedOn: timestamp("deactivated_on").notNull().defaultNow(),
  usageDays: integer("usage_days"),
});

export const Book = pgTable(
  "book",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 500 }).notNull(),
    author: varchar("author", { length: 100 }).notNull(),
    summary: varchar("summary"),
    rating: decimal("rating"),
    pages: integer("pages"),
    publishedOn: date("published_on"),
    createdBy: uuid("created_by")
      .references(() => User.id)
      .notNull(),
    createdOn: timestamp("created_on").notNull().defaultNow(),
  },
  (table) => [
    index("book_name_index").on(table.name),
    index("book_author_index").on(table.author),
  ]
);

export const Note = pgTable(
  "note",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => User.id)
      .notNull(),
    bookId: uuid("book_id")
      .references(() => Book.id)
      .notNull(),
    note: varchar("note").notNull(),
    isPrivate: boolean("is_private").notNull().default(true),
    createdOn: timestamp("created_on").notNull().defaultNow(),
    modifiedOn: timestamp("modified_on").notNull().defaultNow(),
  },
  (table) => [
    index("note_user_index").on(table.userId),
    index("note_book_index").on(table.bookId),
  ]
);

export const Comment = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => User.id)
      .notNull(),
    noteId: uuid("note_id")
      .references(() => Note.id)
      .notNull(),
    comment: varchar("comment").notNull(),
    createdOn: timestamp("created_on").notNull().defaultNow(),
  },
  (table) => [
    index("comment_user_index").on(table.userId),
    index("comment_note_index").on(table.noteId),
  ]
);

export const Bookmark = pgTable(
  "bookmark",
  {
    userId: uuid("user_id")
      .references(() => User.id)
      .notNull(),
    noteId: uuid("note_id")
      .references(() => Note.id)
      .notNull(),
  },
  (table) => [
    uniqueIndex("bookmark_composite_index").on(table.userId, table.noteId),
  ]
);

/**
 * Relations
 */

export const UserLoginRelations = relations(UserLogin, ({ many }) => {
  return {
    user: many(User),
  };
});

export const BookRelations = relations(Book, ({ many }) => {
  return {
    user: many(User),
  };
});

export const NoteRelations = relations(Note, ({ many }) => {
  return {
    user: many(User),
    book: many(Book),
  };
});

export const CommentRelations = relations(Comment, ({ many }) => {
  return {
    user: many(User),
    note: many(Note),
  };
});

export const BookmarkRelations = relations(Bookmark, ({ one }) => {
  return {
    user: one(User, {
      fields: [Bookmark.userId],
      references: [User.id],
    }),
    note: one(Note, {
      fields: [Bookmark.noteId],
      references: [Note.id],
    }),
  };
});

/**
 * Views
 */

// CREATE VIEW IF NOT EXISTS book_notes_vw
// AS
// SELECT
// 	bn.*,
// 	u.fullname AS user,
// 	b.name AS book_name,
// 	b.author,
// 	(
// 	SELECT
// 		COUNT(1)
// 	FROM
// 		comments c
// 	WHERE
// 		c.note_id = bn.id) AS comments,
// 	STRFTIME('%d',
// 	bn.modified_on) || ' ' || SUBSTR('JanFebMarAprMayJunJulAugSepOctNovDec',
// 	1 + 3 * STRFTIME('%m',
// 	bn.modified_on),
// 	-3) AS short_date
// FROM
// 	book_notes bn,
// 	users u,
// 	books b
// WHERE
// 	bn.book_id = b.id
// 	AND bn.user_id = u.id;

export const notesView = pgView("notes_vw", {
  id: text("id"), // Adjust according to your actual column types
  userId: text("user_id"),
  bookId: text("book_id"),
  note: text("note"),
  isPrivate: boolean("is_private"),
  createdOn: timestamp("created_on"),
  modifiedOn: timestamp("modified_on"),
  user: text("user"),
  book: text("book_name"),
  author: text("author"),
  comments: integer("comments"), // Assuming comments is an integer count
  short_date: text("short_date"),
}).as(sql`
  select
    n.*,
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
    n.book_id = b.id;
  `);
