import { and, eq, desc, count } from "drizzle-orm";
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
        gramId: data.gramId,
      })
      .onConflictDoUpdate({
        target: Comment.id,
        set: {
          comment: data.comment,
        },
        setWhere: and(
          eq(Comment.userId, data.userId),
          eq(Comment.gramId, data.gramId)
        ),
      })
      .returning({
        id: Comment.id,
      });
  } catch (error: any) {
    if (error?.code === "23503")
      throw new Error(
        `${constants.assetValidation.userNotExists} or ${constants.assetValidation.gramNotExists}`
      );
    throw new Error(error?.message);
  }
};

/**
 * Gets the comments for gram
 *
 * * Fetch a comment with `comment id`
 * * Filter with `gram id` or `user id` or both
 * * Paginate with `limit` and `offset`
 * @param {string} commentId
 * @param {string} gramId
 * @param {string} userId
 * @param {string} limit
 * @param {string} offset
 * @returns {Promise<any>}
 */
export const getCommentModel = async (
  commentId?: string,
  gramId?: string,
  userId?: string,
  limit?: string,
  offset?: string
): Promise<any> => {
  try {
    let whereClause;
    if (commentId) {
      whereClause = eq(CommentView.id, commentId);
    }
    if (gramId && userId) {
      whereClause = and(
        eq(CommentView.gramId, gramId),
        eq(CommentView.userId, userId)
      );
    } else if (gramId) {
      whereClause = and(eq(CommentView.gramId, gramId));
    } else if (userId) {
      whereClause = and(eq(CommentView.userId, userId));
    }
    const [data, totalRecords] = await Promise.all([
      db
        .select()
        .from(CommentView)
        .where(whereClause)
        .orderBy(desc(CommentView.createdOn))
        .limit(limit ? parseInt(limit!) : 10)
        .offset(parseInt(offset! ?? undefined)),
      db.select({ count: count() }).from(CommentView).where(whereClause),
    ]);
    return { data, totalRecords };
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
 * @param {string} userId
 * @returns {Promise<any>}
 */
export const deleteCommentModel = async (
  id: string,
  userId: string
): Promise<any> => {
  try {
    return await db
      .delete(Comment)
      .where(and(eq(Comment.id, id), eq(Comment.userId, userId)))
      .returning({ id: Comment.id });
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.commentComponent.delete}`
    );
  }
};
