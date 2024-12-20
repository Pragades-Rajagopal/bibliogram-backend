import { desc, eq, ilike, or, asc, count, sql, inArray } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { Book, Gram, User } from "../drizzle/schema";
import { IBook } from "../interfaces/book";
import { updateAppStats } from "./appStats";

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
    const userInfo: { role: "admin" | "user" }[] = await db
      .select({ role: User.role })
      .from(User)
      .where(eq(User.id, userId));
    if (userInfo[0]?.role !== "admin") {
      throw new Error("401");
    }
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
    const result: { id: string }[] = await db
      .insert(Book)
      .values(bulkValues)
      .returning({
        id: Book.id,
      });
    if (result.length) {
      await updateAppStats("book", result.length);
    }
  } catch (error: any) {
    console.error(error);
    if (error?.message === "401") {
      throw new Error(error?.message);
    }
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
 * Gets top books having number of grams
 * @returns {Promise}
 */
export const getTopBooksModel = async (): Promise<any> => {
  try {
    const gramCountSubQuery = db
      .select({
        gramsCount: count().as("gramsCount"),
      })
      .from(Gram)
      .where(eq(Gram.bookId, Book.id))
      .groupBy(Gram.bookId);
    return await db
      .select({
        id: Book.id,
        name: Book.name,
        author: Book.author,
        summary: Book.summary,
        rating: Book.rating,
        pages: Book.pages,
        publishedOn: Book.publishedOn,
        gramsCount: sql<number>`(${gramCountSubQuery})`,
      })
      .from(Book)
      .where(sql`${gramCountSubQuery} > 0`)
      .orderBy(desc(sql`${gramCountSubQuery}`), asc(Book.name))
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
