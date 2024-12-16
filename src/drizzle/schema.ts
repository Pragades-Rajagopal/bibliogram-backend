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
    isPremiumUser: boolean("isPremiumUser").notNull().default(false),
    createdOn: timestamp("created_on").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("username_index").on(table.username)]
);

export const UserLogin = pgTable("user_login", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => User.id, { onDelete: "cascade" })
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
      .references(() => User.id, { onDelete: "cascade" })
      .notNull(),
    bookId: uuid("book_id")
      .references(() => Book.id, { onDelete: "cascade" })
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
      .references(() => User.id, { onDelete: "cascade" })
      .notNull(),
    noteId: uuid("note_id")
      .references(() => Note.id, { onDelete: "cascade" })
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
      .references(() => User.id, { onDelete: "cascade" })
      .notNull(),
    noteId: uuid("note_id")
      .references(() => Note.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    uniqueIndex("bookmark_composite_index").on(table.userId, table.noteId),
  ]
);

export const AppStats = pgTable("app_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  gramsPosted: integer("grams_psted"),
  booksSeeded: integer("books_seeded"),
});

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

export const NoteView = pgView("note_vw", {
  id: text("id"),
  userId: text("user_id"),
  bookId: text("book_id"),
  note: text("note"),
  isPrivate: boolean("is_private"),
  createdOn: timestamp("created_on"),
  modifiedOn: timestamp("modified_on"),
  user: text("user"),
  book: text("book_name"),
  author: text("author"),
  comments: integer("comments"),
  shortDate: text("short_date"),
}).as(sql<string>`
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
`);

export const BookmarkView = pgView("bookmark_vw", {
  noteId: text("note_id"),
  bookmarkUserId: text("bookmark_user_id"),
  noteUserId: text("note_user_id"),
  bookId: text("book_id"),
  note: text("note"),
  isPrivate: boolean("is_private"),
  createdOn: timestamp("created_on"),
  modifiedOn: timestamp("modified_on"),
  user: text("user"),
  book: text("book_name"),
  author: text("author"),
  comments: integer("comments"),
  shortDate: text("short_date"),
}).as(sql<string>`
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
`);

export const CommentView = pgView("comment_vw", {
  id: text("id"),
  userId: text("user_id"),
  noteId: text("note_id"),
  comment: text("comment"),
  createdOn: timestamp("created_on"),
  user: text("user"),
  shortDate: text("short_date"),
}).as(sql<string>`
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
`);
