import { and, eq, sql, desc } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { Bookmark, BookmarkView, Note, NoteView } from "../drizzle/schema";
import { INote, IBookmarkNote } from "../interfaces/book";

/**
 * Add note for the given `book_id`
 * @param {INote} data
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
export const getNoteModel = async (
  noteId?: string,
  bookId?: string,
  userId?: string,
  limit?: string,
  offset?: string
): Promise<any> => {
  try {
    let whereClause;
    if (noteId) {
      // Get note by id
      whereClause = eq(NoteView.id, noteId);
    }
    if (bookId && userId) {
      whereClause = and(
        eq(NoteView.bookId, bookId),
        eq(NoteView.userId, userId),
        eq(NoteView.isPrivate, false)
      );
    } else if (bookId) {
      // Get all public notes for the given book
      whereClause = and(
        eq(NoteView.bookId, bookId),
        eq(NoteView.isPrivate, false)
      );
    } else if (userId) {
      // Get all notes for the given user
      whereClause = and(
        eq(NoteView.userId, userId),
        eq(NoteView.isPrivate, false)
      );
    }
    return await db
      .select()
      .from(NoteView)
      .where(whereClause ?? eq(NoteView.isPrivate, false))
      .orderBy(desc(NoteView.modifiedOn))
      .limit(limit ? parseInt(limit!) : 10)
      .offset(parseInt(offset! ?? undefined));
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.noteComponent.get}`
    );
  }
};

/**
 * Update the note visibility
 * @param {string} id
 * @param {string} flag 'public' | 'private'
 * @returns {Promise}
 */
export const updateNoteVisibilityModel = async (
  id: string,
  flag: string
): Promise<any> => {
  try {
    return await db
      .update(Note)
      .set({
        isPrivate: flag === "private" ? true : false,
        modifiedOn: sql<string>`now()`,
      })
      .where(eq(Note.id, id))
      .returning({
        id: Note.id,
      });
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.noteComponent.updateVisibility}`
    );
  }
};

/**
 * Deletes a note
 * @param {string} id
 * @returns {Promise}
 */
export const deleteNoteModel = async (id: string): Promise<any> => {
  try {
    return await db.delete(Note).where(eq(Note.id, id)).returning({
      id: Note.id,
    });
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.noteComponent.delete}`
    );
  }
};

/**
 * Bookmark a note for later
 * @param {IBookmarkNote} data
 * @returns {Promise}
 */
export const saveBookmarkModel = async (data: IBookmarkNote): Promise<any> => {
  try {
    return await db
      .insert(Bookmark)
      .values({
        userId: data.userId,
        noteId: data.noteId,
      })
      .returning({
        id: Bookmark.noteId,
      });
  } catch (error: any) {
    if (error?.code === "23503")
      throw new Error(
        `${constants.assetValidation.userNotExists} or ${constants.assetValidation.bookNotExists}`
      );
    if (error?.code === "23505") throw new Error(constants.bookmark.exists);
    throw new Error(error?.message);
  }
};

/**
 * Get bookmarks for an user
 * @param {string} userId
 * @returns {Promise<any>}
 */
export const getBookmarksModel = async (userId: string): Promise<any> => {
  try {
    return await db
      .select()
      .from(BookmarkView)
      .where(eq(BookmarkView.userId, userId));
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookmarkNoteComponent.get}`
    );
  }
};
