import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../drizzle/db";
import { Book, Note, NoteView } from "../drizzle/schema";
import constants from "../config/constants";

/**
 * Global books and note search
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
            FROM note n
            WHERE n.book_id = ${Book.id}
          )`.as("field5"),
      })
      .from(Book)
      .where(
        or(
          ilike(Book.name, `%${searchValue}%`),
          ilike(Book.author, `%${searchValue}%`)
        )
      );
    const noteQuery = db
      .select({
        type: sql`'note'`,
        id: NoteView.id,
        field1: NoteView.note,
        field2: NoteView.user,
        field3: NoteView.book,
        field4: NoteView.author,
        field5: NoteView.shortDate,
      })
      .from(NoteView)
      .where(
        and(
          ilike(NoteView.note, `%${searchValue}%`),
          eq(NoteView.isPrivate, false)
        )
      );
    const [bookResult, noteResult] = await Promise.all([bookQuery, noteQuery]);
    return [...bookResult, ...noteResult];
  } catch (error) {
    console.error(error);
    throw new Error(constants.search.error);
  }
};
