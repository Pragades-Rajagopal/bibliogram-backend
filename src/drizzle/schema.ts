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

export const Gram = pgTable(
  "gram",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => User.id, { onDelete: "cascade" })
      .notNull(),
    bookId: uuid("book_id")
      .references(() => Book.id, { onDelete: "cascade" })
      .notNull(),
    gram: varchar("gram").notNull(),
    isPrivate: boolean("is_private").notNull().default(true),
    createdOn: timestamp("created_on").notNull().defaultNow(),
    modifiedOn: timestamp("modified_on").notNull().defaultNow(),
  },
  (table) => [
    index("gram_user_index").on(table.userId),
    index("gram_book_index").on(table.bookId),
  ]
);

export const Comment = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => User.id, { onDelete: "cascade" })
      .notNull(),
    gramId: uuid("gram_id")
      .references(() => Gram.id, { onDelete: "cascade" })
      .notNull(),
    comment: varchar("comment").notNull(),
    createdOn: timestamp("created_on").notNull().defaultNow(),
  },
  (table) => [
    index("comment_user_index").on(table.userId),
    index("comment_gram_index").on(table.gramId),
  ]
);

export const Bookmark = pgTable(
  "bookmark",
  {
    userId: uuid("user_id")
      .references(() => User.id, { onDelete: "cascade" })
      .notNull(),
    gramId: uuid("gram_id")
      .references(() => Gram.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    uniqueIndex("bookmark_composite_index").on(table.userId, table.gramId),
  ]
);

export const AppStats = pgTable("app_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  gramsPosted: integer("grams_posted"),
  booksSeeded: integer("books_seeded"),
});

export const UserStats = pgTable("user_stats", {
  userId: uuid("user_id")
    .references(() => User.id, { onDelete: "cascade" })
    .primaryKey()
    .notNull(),
  gramsCount: integer("grams_count"),
  wishlist: integer("wishlist"),
  completedBooks: integer("completed_books"),
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

export const GramRelations = relations(Gram, ({ many }) => {
  return {
    user: many(User),
    book: many(Book),
  };
});

export const CommentRelations = relations(Comment, ({ many }) => {
  return {
    user: many(User),
    gram: many(Gram),
  };
});

export const BookmarkRelations = relations(Bookmark, ({ one }) => {
  return {
    user: one(User, {
      fields: [Bookmark.userId],
      references: [User.id],
    }),
    gram: one(Gram, {
      fields: [Bookmark.gramId],
      references: [Gram.id],
    }),
  };
});

export const UserStatRelations = relations(UserStats, ({ one }) => {
  return {
    user: one(User, {
      fields: [UserStats.userId],
      references: [User.id],
    }),
  };
});

/**
 * Views
 */

export const GramView = pgView("gram_vw", {
  id: text("id"),
  userId: text("user_id"),
  bookId: text("book_id"),
  gram: text("gram"),
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
`);

export const BookmarkView = pgView("bookmark_vw", {
  gramId: text("gram_id"),
  bookmarkUserId: text("bookmark_user_id"),
  gramUserId: text("gram_user_id"),
  bookId: text("book_id"),
  gram: text("gram"),
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
`);

export const CommentView = pgView("comment_vw", {
  id: text("id"),
  userId: text("user_id"),
  gramId: text("gram_id"),
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
