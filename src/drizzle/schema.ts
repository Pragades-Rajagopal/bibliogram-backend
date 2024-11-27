import { relations } from "drizzle-orm";
import {
  boolean,
  uniqueIndex,
  integer,
  pgEnum,
  pgTable,
  uuid,
  varchar,
  real,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";

export const UserStatus = pgEnum("user_status", ["active", "inactive"]);
export const UserRole = pgEnum("user_role", ["user", "admin"]);

export const User = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullname: varchar("fullName", { length: 100 }).notNull(),
    username: varchar("username", { length: 16 }).notNull(),
    privateKey: varchar("privateKey"),
    status: UserStatus("status").notNull().default("active"),
    role: UserRole("role").notNull().default("user"),
    createdOn: timestamp("createdOn").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("usernameIndex").on(table.username)]
);

export const UserLogin = pgTable("user_login", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .references(() => User.id)
    .notNull(),
  token: varchar("token").notNull(),
  loggedIn: timestamp("loggedIn").notNull().defaultNow(),
  loggedOut: timestamp("loggedOut"),
});

export const DeactivatedUser = pgTable("deactivated_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId"),
  fullname: varchar("fullName", { length: 100 }),
  username: varchar("username", { length: 16 }),
  deactivatedOn: timestamp("deactivatedOn"),
  usageDays: integer("usageDays"),
});

export const UserLoginRelations = relations(UserLogin, ({ many }) => {
  return {
    user: many(User),
  };
});
