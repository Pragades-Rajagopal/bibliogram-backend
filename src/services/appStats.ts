import { eq, sql } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { AppStats } from "../drizzle/schema";

/**
 * Updates app stats for app base page
 * @param {string} type
 * @param {number} increment
 * @returns {Promise}
 */
export const updateStats = async (
  type: "note" | "book",
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
        gramsPosted: type === "note" ? 0 + increment : 0,
        booksSeeded: type === "book" ? 0 + increment : 0,
      });
    } else {
      await db
        .update(AppStats)
        .set({
          gramsPosted:
            type === "note"
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
 * Retrieves app stats
 * @param {string} userId
 * @returns {Promise<any>}
 */
export const getStats = async (userId: string): Promise<any> => {
  try {
    const result = db.execute(sql`
            select
                grams_psted::text,
                books_seeded::text,
                top_books_count.count as "top_books",
                user_grams.count as "your_grams"
            from
                app_stats,
                (
                select
                    count(1)
                from
                    (
                    select
                        (
                        select
                            COUNT(1)
                        from
                            note n
                        where
                            n.book_id = b.id) as "notes_count",
                        b.name
                    from
                        book b)
                where
                    "notes_count" > 0
                limit 50) as top_books_count,
                (
                select
                    count(1)
                from
                    note
                where
                    user_id = ${userId}) as user_grams;
        `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.appStats.get}`
    );
  }
};
