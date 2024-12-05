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
