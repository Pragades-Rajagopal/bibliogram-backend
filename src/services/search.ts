import { and, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../drizzle/db";
import { Book, GramView } from "../drizzle/schema";
import constants from "../config/constants";

/**
 * Global books and gram search
 * @param {string} value
 * @returns {Promise<any>}
 */
export const searchModel = async (value: string): Promise<any> => {
  try {
    const searchValue = value.toLowerCase();
    const bookQuery = db
      .select({
        type: sql<string>`'book'`,
        id: Book.id,
        field1: Book.name,
        field2: sql<string>`''`,
        field3: sql<string>`''`,
        field4: Book.author,
        field5: sql<string>`(
          SELECT COUNT(1)
          FROM gram
          WHERE book_id = book.id
        )::text`,
      })
      .from(Book)
      .where(
        or(
          ilike(Book.name, `%${searchValue}%`),
          ilike(Book.author, `%${searchValue}%`)
        )
      );
    const gramQuery = db
      .select({
        type: sql`'gram'`,
        id: GramView.id,
        field1: GramView.gram,
        field2: GramView.user,
        field3: GramView.book,
        field4: GramView.author,
        field5: GramView.shortDate,
      })
      .from(GramView)
      .where(
        and(
          ilike(GramView.gram, `%${searchValue}%`),
          eq(GramView.isPrivate, false)
        )
      );
    const [bookResult, gramResult] = await Promise.all([bookQuery, gramQuery]);
    return [...bookResult, ...gramResult];
  } catch (error) {
    console.error(error);
    throw new Error(constants.search.error);
  }
};
