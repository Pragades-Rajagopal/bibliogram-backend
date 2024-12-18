import { and, eq, sql, desc } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { Bookmark, BookmarkView, Gram, GramView } from "../drizzle/schema";
import { IGram, IBookmarkGram } from "../interfaces/book";
import {
  decrementStatsCount,
  updateAppStats,
  updateUserStats,
} from "./appStats";

/**
 * Add/update gram
 * @param {IGram} data
 * @returns {Promise}
 */
export const upsertGramModel = async (data: IGram): Promise<any> => {
  try {
    const result: {
      id: string;
    }[] = await db
      .insert(Gram)
      .values({
        id: data.id,
        gram: data.gram,
        userId: data.userId,
        bookId: data.bookId,
        isPrivate: data.isPrivate,
      })
      .onConflictDoUpdate({
        target: Gram.id,
        set: {
          gram: data.gram,
          isPrivate: data.isPrivate,
          modifiedOn: sql`now()`,
        },
        setWhere: and(
          eq(Gram.userId, data.userId),
          eq(Gram.bookId, data.bookId)
        ),
      })
      .returning({
        id: Gram.id,
      });
    if (result[0]?.id) {
      await updateAppStats("gram", 1);
      await updateUserStats(data.userId, "gram", 1);
    }
    return result;
  } catch (error: any) {
    if (error?.code === "23503")
      throw new Error(
        `${constants.assetValidation.userNotExists} or ${constants.assetValidation.bookNotExists}`
      );
    throw new Error(error?.message);
  }
};

/**
 * Gets the book gram
 *
 * * Fetch a gram with `gram id`
 * * Filter with `book id` or `user id` or both
 * * Paginate with `limit` and `offset`
 * @param {string} gramId
 * @param {string} bookId
 * @param {string} userId
 * @param {string} limit
 * @param {string} offset
 * @returns {Promise}
 */
export const getGramModel = async (
  gramId?: string,
  bookId?: string,
  userId?: string,
  limit?: string,
  offset?: string
): Promise<any> => {
  try {
    let whereClause;
    if (gramId) {
      // Get gram by id
      whereClause = eq(GramView.id, gramId);
    }
    if (bookId && userId) {
      whereClause = and(
        eq(GramView.bookId, bookId),
        eq(GramView.userId, userId),
        eq(GramView.isPrivate, false)
      );
    } else if (bookId) {
      // Get all public grams for the given book
      whereClause = and(
        eq(GramView.bookId, bookId),
        eq(GramView.isPrivate, false)
      );
    } else if (userId) {
      // Get all grams for the given user
      whereClause = and(
        eq(GramView.userId, userId),
        eq(GramView.isPrivate, false)
      );
    }
    return await db
      .select()
      .from(GramView)
      .where(whereClause ?? eq(GramView.isPrivate, false))
      .orderBy(desc(GramView.modifiedOn))
      .limit(limit ? parseInt(limit!) : 10)
      .offset(parseInt(offset! ?? undefined));
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.gramComponent.get}`
    );
  }
};

/**
 * Update the gram visibility
 * @param {string} id
 * @param {string} flag 'public' | 'private'
 * @returns {Promise}
 */
export const updateGramVisibilityModel = async (
  id: string,
  flag: string
): Promise<any> => {
  try {
    return await db
      .update(Gram)
      .set({
        isPrivate: flag === "private" ? true : false,
        modifiedOn: sql<string>`now()`,
      })
      .where(eq(Gram.id, id))
      .returning({
        id: Gram.id,
      });
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.gramComponent.updateVisibility}`
    );
  }
};

/**
 * Deletes a gram
 * @param {string} id
 * @param {string} userId
 * @returns {Promise}
 */
export const deleteGramModel = async (
  id: string,
  userId: string
): Promise<any> => {
  try {
    const result = await db
      .delete(Gram)
      .where(and(eq(Gram.id, id), eq(Gram.userId, userId)))
      .returning({
        id: Gram.id,
      });
    if (result[0]?.id) await decrementStatsCount(userId, "gram");
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.gramComponent.delete}`
    );
  }
};

/**
 * Bookmark a gram for later
 * @param {IBookmarkGram} data
 * @returns {Promise}
 */
export const saveBookmarkModel = async (data: IBookmarkGram): Promise<any> => {
  try {
    return await db
      .insert(Bookmark)
      .values({
        userId: data.userId,
        gramId: data.gramId,
      })
      .returning({
        id: Bookmark.gramId,
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
      .where(eq(BookmarkView.bookmarkUserId, userId));
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookmarkGramComponent.get}`
    );
  }
};

/**
 * Deletes bookmark
 * @param {string} gramId
 * @param {string} userId
 * @returns {Promise}
 */
export const deleteBookmarkModel = async (
  gramId: string,
  userId: string
): Promise<any> => {
  try {
    return await db
      .delete(Bookmark)
      .where(and(eq(Bookmark.gramId, gramId), eq(Bookmark.userId, userId)))
      .returning({
        gramId: Bookmark.gramId,
      });
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookmarkGramComponent.remove}`
    );
  }
};

/**
 * Checks if the gram is bookmarked or not
 * @param {string} gramId
 * @param {string} userId
 * @returns {Promise}
 */
export const isGramBookmarkedModel = async (
  gramId: string,
  userId: string
): Promise<any> => {
  try {
    return await db
      .select({
        gramId: Bookmark.gramId,
      })
      .from(Bookmark)
      .where(and(eq(Bookmark.gramId, gramId), eq(Bookmark.userId, userId)));
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.bookmarkGramComponent.check}`
    );
  }
};
