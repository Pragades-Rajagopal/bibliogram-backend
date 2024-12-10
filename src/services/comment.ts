import { and, eq, desc } from "drizzle-orm";
import { db } from "../drizzle/db";
import { Comment, CommentView } from "../drizzle/schema";
import { IComment } from "../interfaces/book";
import constants from "../config/constants";

/**
 * Add/update comment
 * @param {IComment} data
 * @returns {Promise<any>}
 */
export const upsertCommentModel = async (data: IComment): Promise<any> => {
  try {
    return await db
      .insert(Comment)
      .values({
        id: data.id,
        comment: data.comment,
        userId: data.userId,
        noteId: data.noteId,
      })
      .onConflictDoUpdate({
        target: Comment.id,
        set: {
          comment: data.comment,
        },
        setWhere: and(
          eq(Comment.userId, data.userId),
          eq(Comment.noteId, data.noteId)
        ),
      })
      .returning({
        id: Comment.id,
      });
  } catch (error: any) {
    if (error?.code === "23503")
      throw new Error(
        `${constants.assetValidation.userNotExists} or ${constants.assetValidation.noteNotExists}`
      );
    throw new Error(error?.message);
  }
};

/**
 * Gets the comments for note
 *
 * * Fetch a comment with `comment id`
 * * Filter with `note id` or `user id` or both
 * * Paginate with `limit` and `offset`
 * @param {string} commentId
 * @param {string} noteId
 * @param {string} userId
 * @param {string} limit
 * @param {string} offset
 * @returns {Promise<any>}
 */
export const getCommentModel = async (
  commentId?: string,
  noteId?: string,
  userId?: string,
  limit?: string,
  offset?: string
): Promise<any> => {
  try {
    let whereClause;
    if (commentId) {
      whereClause = eq(CommentView.id, commentId);
    }
    if (noteId && userId) {
      whereClause = and(
        eq(CommentView.noteId, noteId),
        eq(CommentView.userId, userId)
      );
    } else if (noteId) {
      whereClause = and(eq(CommentView.noteId, noteId));
    } else if (userId) {
      whereClause = and(eq(CommentView.userId, userId));
    }
    return await db
      .select()
      .from(CommentView)
      .where(whereClause)
      .orderBy(desc(CommentView.createdOn))
      .limit(limit ? parseInt(limit!) : 10)
      .offset(parseInt(offset! ?? undefined));
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.commentComponent.get}`
    );
  }
};

/**
 * Deletes a comment
 * @param {string} id
 * @returns {Promise}
 */
export const deleteCommentModel = async (id: string): Promise<any> => {
  try {
    return await db
      .delete(Comment)
      .where(eq(Comment.id, id))
      .returning({ id: Comment.id });
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.commentComponent.delete}`
    );
  }
};
