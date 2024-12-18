import { eq, sql } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { AppStats, UserStats } from "../drizzle/schema";

/**
 * Updates app stats for app base page
 * @param {string} type
 * @param {number} increment
 * @returns {Promise}
 */
export const updateAppStats = async (
  type: "gram" | "book",
  increment: number
): Promise<any> => {
  try {
    const statsInfo: {
      id: string;
      grams: number | null;
      books: number | null;
    }[] = await db
      .select({
        id: AppStats.id,
        grams: AppStats.gramsPosted,
        books: AppStats.booksSeeded,
      })
      .from(AppStats);
    if (!statsInfo || statsInfo.length === 0) {
      await db.insert(AppStats).values({
        gramsPosted: type === "gram" ? 0 + increment : 0,
        booksSeeded: type === "book" ? 0 + increment : 0,
      });
    } else {
      await db
        .update(AppStats)
        .set({
          gramsPosted:
            type === "gram"
              ? statsInfo[0]?.grams! + increment
              : statsInfo[0]?.grams!,
          booksSeeded:
            type === "book"
              ? statsInfo[0]?.books! + increment
              : statsInfo[0]?.books!,
        })
        .where(eq(AppStats.id, statsInfo[0].id));
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.appStats.upsert}`
    );
  }
};

/**
 * Updates user stats for app base page
 * @param {string} userId
 * @param {string} type
 * @param {number} increment
 * @returns {Promise}
 */
export const updateUserStats = async (
  userId: string,
  type: "gram" | "wishlist",
  increment: number
): Promise<any> => {
  try {
    const statsInfo: {
      userId: string;
      gramsCount: number | null;
      wishlist: number | null;
      conpletedBooks: number | null;
    }[] = await db
      .select({
        userId: UserStats.userId,
        gramsCount: UserStats.gramsCount,
        wishlist: UserStats.wishlist,
        conpletedBooks: UserStats.completedBooks,
      })
      .from(UserStats)
      .where(eq(UserStats.userId, userId));
    if (!statsInfo || statsInfo.length === 0) {
      await db.insert(UserStats).values({
        userId: userId,
        gramsCount: type === "gram" ? 0 + increment : 0,
        wishlist: type === "wishlist" ? 0 + increment : 0,
        completedBooks: type === "wishlist" ? 0 + increment : 0,
      });
    } else {
      await db
        .update(UserStats)
        .set({
          gramsCount:
            type === "gram"
              ? statsInfo[0]?.gramsCount! + increment
              : statsInfo[0]?.gramsCount!,
          wishlist:
            type === "wishlist"
              ? statsInfo[0]?.wishlist! + increment
              : statsInfo[0]?.wishlist!,
          completedBooks:
            type === "wishlist"
              ? statsInfo[0]?.conpletedBooks! + increment
              : statsInfo[0]?.conpletedBooks!,
        })
        .where(eq(UserStats.userId, statsInfo[0].userId));
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.userStats.upsert}`
    );
  }
};

/**
 * Retrieves app stats
 * @param {string} userId
 * @returns {Promise<any>}
 */
export const getStats = async (userId: string): Promise<any> => {
  try {
    const result = db.execute(sql`
            select
              as1.grams_posted,
              as1.books_seeded,
              us.grams_count as "your_grams",
              us.wishlist,
              us.completed_books as "books_completed"
            from
              app_stats as1
            full outer join user_stats us on
              1 = 1
            where
              us.user_id = ${userId}
        `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.appStats.get}`
    );
  }
};

/**
 * Decrements stats count upon gram deletion
 * @param {string} userId
 * @param {string} type
 * @returns {Promise<void>}
 */
export const decrementStatsCount = async (
  userId: string,
  type: "gram" | "wishlist"
): Promise<void> => {
  try {
    const userStatInfo: {
      userId: string;
      gramsCount: number | null;
      wishlist: number | null;
      conpletedBooks: number | null;
    }[] = await db
      .select({
        userId: UserStats.userId,
        gramsCount: UserStats.gramsCount,
        wishlist: UserStats.wishlist,
        conpletedBooks: UserStats.completedBooks,
      })
      .from(UserStats)
      .where(eq(UserStats.userId, userId));

    const appStatsInfo: {
      id: string;
      grams: number | null;
      books: number | null;
    }[] = await db
      .select({
        id: AppStats.id,
        grams: AppStats.gramsPosted,
        books: AppStats.booksSeeded,
      })
      .from(AppStats);
    await db
      .update(AppStats)
      .set({
        gramsPosted:
          type === "gram"
            ? appStatsInfo[0]?.grams! - 1
            : appStatsInfo[0]?.grams!,
      })
      .where(eq(AppStats.id, appStatsInfo[0].id));
    await db
      .update(UserStats)
      .set({
        gramsCount:
          type === "gram"
            ? userStatInfo[0]?.gramsCount! - 1
            : userStatInfo[0]?.gramsCount!,
        wishlist:
          type === "wishlist"
            ? userStatInfo[0]?.wishlist! - 1
            : userStatInfo[0]?.wishlist!,
        completedBooks:
          type === "wishlist"
            ? userStatInfo[0]?.conpletedBooks! - 1
            : userStatInfo[0]?.conpletedBooks!,
      })
      .where(eq(UserStats.userId, userStatInfo[0].userId));
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.appStats.decrement}`
    );
  }
};
