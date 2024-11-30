import { relations } from "drizzle-orm";
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

export const UserLoginRelations = relations(UserLogin, ({ many }) => {
  return {
    user: many(User),
  };
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
    role: UserRole("role").notNull().default("user"),
    publishedOn: date("published_on"),
    createdOn: timestamp("created_on").notNull().defaultNow(),
  },
  (table) => [
    index("book_name_index").on(table.name),
    index("book_author_index").on(table.author),
  ]
);

// CREATE TABLE IF NOT EXISTS book_notes (
//   id INTEGER PRIMARY KEY,
//   user_id INTEGER,
//   book_id INTEGER,
//   notes TEXT NOT NULL,
//   is_private INTEGER CHECK( is_private IN (0, 1) ) NOT NULL DEFAULT 1,
//   created_on DATETIME NOT NULL,
//   modified_on DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users (id),
//   FOREIGN KEY (book_id) REFERENCES books (id)
// );

// CREATE TABLE IF NOT EXISTS comments (
//   id INTEGER PRIMARY KEY,
//   user_id INTEGER,
//   note_id INTEGER,
//   comment TEXT NOT NULL,
//   created_on DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users (id),
//   FOREIGN KEY (note_id) REFERENCES book_notes (id)
// );

// CREATE TABLE IF NOT EXISTS saved_notes (
//   user_id INTEGER,
//   note_id INTEGER,
//   FOREIGN KEY (user_id) REFERENCES users (id),
//   FOREIGN KEY (note_id) REFERENCES book_notes (id),
//   PRIMARY KEY (user_id, note_id)
// );
