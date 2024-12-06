import { and, eq, sql } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { Note } from "../drizzle/schema";
import { INote } from "../interfaces/book";

/**
 * Add note for the given `book_id`
 * @param {BookNote} data
 * @returns {Promise}
 */
export const upsertNoteModel = async (data: INote): Promise<any> => {
  try {
    await db
      .insert(Note)
      .values({
        id: data.id,
        note: data.note,
        userId: data.userId,
        bookId: data.bookId,
        isPrivate: data.isPrivate,
      })
      .onConflictDoUpdate({
        target: Note.id,
        set: {
          note: data.note,
          isPrivate: data.isPrivate,
          modifiedOn: sql`now()`,
        },
        targetWhere: and(
          eq(Note.userId, data.userId),
          eq(Note.bookId, data.bookId)
        ),
      });
  } catch (error: any) {
    if (error?.code === "23503")
      throw new Error(
        `${constants.assetValidation.userNotExists} or ${constants.assetValidation.bookNotExists}`
      );
    throw new Error(error?.message);
  }
};

/**
 * Gets the book note
 *
 * * Fetch a note with `note id`
 * * Filter with `book id` or `user id` or both
 * * Paginate with `limit` and `offset`
 * @param {string} noteId
 * @param {string} bookId
 * @param {string} userId
 * @param {string} limit
 * @param {string} offset
 * @returns {Promise}
 */
// export const getNoteModel = (
//   noteId?: string,
//   bookId?: string,
//   userId?: string,
//   limit?: string,
//   offset?: string
// ): Promise<any> => {
//   // For global notes
//   let sql: string =
//     userId || bookId || noteId
//       ? `SELECT * FROM book_notes_vw`
//       : `SELECT * FROM book_notes_vw WHERE is_private=0`;
//   if (noteId) {
//     // Get note by id
//     sql = sql + ` WHERE id=${noteId}`;
//   }
//   if (bookId && userId) {
//     sql =
//       sql + ` WHERE book_id=${bookId} AND user_id=${userId} AND is_private=0`;
//   } else if (bookId) {
//     // Get all public notes for the given book
//     sql = sql + ` WHERE book_id=${bookId} AND is_private=0`;
//   } else if (userId) {
//     // Get all notes for the given user
//     sql = sql + ` WHERE user_id=${userId}`;
//   }
//   sql = sql + ` ORDER BY modified_on DESC`;
//   if (limit) {
//     sql = sql + ` LIMIT ${limit}`;
//   }
//   if (offset) {
//     sql = sql + ` OFFSET ${offset}`;
//   }
//   return new Promise((resolve, reject): any => {
//     console.log(`sql > ${sql}`);
//     appDB.all(sql, [], (err, data) => {
//       if (err) {
//         reject("Error at getNoteModel method");
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };
