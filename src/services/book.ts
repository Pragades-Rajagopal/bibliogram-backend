import constants from "../config/constants";
import { db } from "../drizzle/db";
import { Book } from "../drizzle/schema";
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
