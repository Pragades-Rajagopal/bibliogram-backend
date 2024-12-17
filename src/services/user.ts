import { and, eq, sql } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { DeactivatedUser, User, UserLogin, UserStats } from "../drizzle/schema";
import { SaveUserRequest } from "../interfaces/user";

/**
 * Saves user upon registration
 * @param {userModel.ISaveUserRequest} data
 * @returns {Promise}
 */
export const saveUserModel = async (data: SaveUserRequest): Promise<any> => {
  try {
    const user = await db
      .insert(User)
      .values({
        fullname: data.fullname,
        username: data.username,
        privateKey: data.privateKey,
        role: data.role ?? "user",
      })
      .returning({
        userId: User.id,
      });
    // Create a dummy entry in user_stats model
    if (user[0]?.userId) {
      await db.insert(UserStats).values({
        userId: user[0]?.userId,
        gramsCount: 0,
        wishlist: 0,
        completedBooks: 0,
      });
    }
  } catch (error: any) {
    console.error(`saveUserModel error > ${error}`);
    if (error?.code == constants.databaseErrors.uniqueConstraintCode) {
      throw new Error(constants.databaseErrors.constraint);
    }
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.userComponent.saveUser}`
    );
  }
};

/**
 * Gets necessary user info for token payload
 * @param {string} username
 * @param {string} userId
 * @returns {Promise}
 */
export const getUserInfoModel = async (
  username: string,
  userId?: string
): Promise<any> => {
  try {
    const condition = userId
      ? eq(User.id, userId)
      : eq(User.username, username);
    return await db
      .select({
        id: User.id,
        username: User.username,
        fullname: User.fullname,
        privateKey: User.privateKey,
      })
      .from(User)
      .where(and(condition, eq(User.status, "active")));
  } catch (error: any) {
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.userComponent.getUser}`
    );
  }
};

/**
 * Saves user login info after successful login
 *
 * `gram: Deletes previous login entry`
 * @param {string} userId
 * @param {string} token
 * @returns null
 */
export const saveUserLogin = async (
  userId: string,
  token: string
): Promise<any> => {
  try {
    await db.delete(UserLogin).where(eq(UserLogin.userId, userId));
    await db.insert(UserLogin).values({
      userId: userId,
      token: token,
    });
  } catch (error: any) {
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.userComponent.saveLogin}`
    );
  }
};

/**
 * Updates logout time for logged out user
 * @param {string} userId
 * @returns {Promise}
 */
export const updateUserLogout = async (userId: string): Promise<any> => {
  try {
    return await db
      .update(UserLogin)
      .set({
        loggedOut: sql`now()`,
      })
      .where(eq(UserLogin.userId, userId))
      .returning({
        userId: UserLogin.userId,
      });
  } catch (error: any) {
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.userComponent.updateLogout}`
    );
  }
};

/**
 * Save user info to deactivated user model upon deactivation and deletes
 * all user information
 * @param {string} userId
 * @returns {Promise}
 */
export const deactivateUserModel = async (userId: string): Promise<any> => {
  try {
    const userInfo = await db
      .select({
        id: User.id,
        username: User.username,
        fullname: User.fullname,
        createdOn: User.createdOn,
      })
      .from(User)
      .where(and(eq(User.id, userId), eq(User.status, "active")));
    await db
      .transaction(async (tx) => {
        await tx.insert(DeactivatedUser).values({
          userId: userInfo[0].id,
          fullname: userInfo[0].fullname,
          username: userInfo[0].username,
          usageDays: getUsageDays(userInfo[0].createdOn),
        });
        await tx.delete(User).where(eq(User.id, userId));
      })
      .catch((error: any) => {
        console.error(error);
        throw new Error(
          `${constants.commonServerError.internal} - ${constants.debugErrorCodes.userComponent.deactivate}`
        );
      });
  } catch (error: any) {
    console.error(error);
    throw new Error(
      `${constants.commonServerError.internal} - ${constants.debugErrorCodes.userComponent.deactivate}`
    );
  }
};

/**
 * Gets the number of days the user has user the service before deactivating
 * @param {Date} date
 * @returns {number}
 */
const getUsageDays = (date: Date): number => {
  return Math.round(
    (new Date().getTime() - date.getTime()) / (1000 * 24 * 60 * 60)
  );
};
