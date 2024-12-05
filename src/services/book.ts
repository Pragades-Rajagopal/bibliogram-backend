import { desc, eq, ilike, or, asc, count, sql, inArray } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { Book, Note } from "../drizzle/schema";
import { IBook } from "../interfaces/book";

/**
 * Adds book data with bulk load
 * @param {Book[]} books
 * @returns {Promise}
 */
export const bulkInsertBookModel = async (
  books: IBook[],
  userId: string
): Promise<any> => {
  try {
    let bulkValues: any[] = [];
    for (const book of books) {
      bulkValues.push({
        name: book.name,
        author: book.author,
        summary: book.summary,
        rating: book.rating,
        pages: book.pages,
        publishedOn: book.publishedOn,
        createdBy: userId,
      });
    }
    await db.insert(Book).values(bulkValues);
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookComponent.bulkAdd}`
    );
  }
};

/**
 * Get all books
 *
 * * query with `name` or `author` or both
 * * paginate the result with `limit` and `offset`
 * @param {IBook} query
 * @param {string} limit
 * @param {string} offset
 * @returns {Promise}
 */
export const getAllBooksModel = async (
  query: string,
  limit: string | undefined,
  offset?: string | undefined
): Promise<any> => {
  try {
    return await db
      .select()
      .from(Book)
      .where(
        query
          ? or(ilike(Book.name, `%${query}%`), ilike(Book.author, `%${query}%`))
          : undefined
      )
      .orderBy(desc(Book.id))
      .limit(limit ? parseInt(limit!) : 10)
      .offset(parseInt(offset! ?? undefined));
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookComponent.getBooks}`
    );
  }
};

/**
 * Get a book detail
 * @param {string} id
 * @returns {Promise}
 */
export const getBook = async (id: string): Promise<any> => {
  try {
    return await db.select().from(Book).where(eq(Book.id, id));
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookComponent.getBookById}`
    );
  }
};

/**
 * Gets top books having number of notes
 * @returns {Promise}
 */
export const getTopBooksModel = async (): Promise<any> => {
  try {
    const notesCountSubQuery = db
      .select({
        notesCount: count().as("notesCount"),
      })
      .from(Note)
      .where(eq(Note.bookId, Book.id))
      .groupBy(Note.bookId);
    return await db
      .select({
        id: Book.id,
        name: Book.name,
        author: Book.author,
        summary: Book.summary,
        rating: Book.rating,
        pages: Book.pages,
        publishedOn: Book.publishedOn,
        notesCount: sql<number>`(${notesCountSubQuery})`,
      })
      .from(Book)
      .where(sql`${notesCountSubQuery} > 0`)
      .orderBy(desc(sql`${notesCountSubQuery}`), asc(Book.name))
      .limit(50);
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookComponent.getTopBooks}`
    );
  }
};

/**
 * Deletes books in bulk
 * @param {string[]}ids
 * @returns {Promise}
 */
export const deleteBookModel = async (ids: string[]): Promise<any> => {
  try {
    await db.delete(Book).where(inArray(Book.id, ids));
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookComponent.bulkDelete}`
    );
  }
};
