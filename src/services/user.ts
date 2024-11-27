import { and, eq } from "drizzle-orm";
import constants from "../config/constants";
import { db } from "../drizzle/db";
import { User, UserLogin } from "../drizzle/schema";
import { SaveUserRequest } from "../interfaces/user";

/**
 * Saves user upon registration
 * @param {userModel.ISaveUserRequest} data
 * @returns {Promise}
 */
export const saveUserModel = async (data: SaveUserRequest): Promise<any> => {
  try {
    await db.insert(User).values({
      fullname: data.fullname,
      username: data.username,
      privateKey: data.privateKey,
    });
  } catch (error: any) {
    console.error(`saveUserModel error > ${error}`);
    if (error?.code == constants.databaseErrors.uniqueConstraintCode) {
      throw new Error(constants.databaseErrors.constraint);
    }
    throw new Error(constants.commonServerError.internal);
  }
};

/**
 * Gets necessary user info for token payload
 * @param {string} username
 * @returns {Promise}
 */
export const getUserInfoModel = async (username: string): Promise<any> => {
  try {
    return await db
      .select({
        id: User.id,
        username: User.username,
        fullname: User.fullname,
        privateKey: User.privateKey,
      })
      .from(User)
      .where(and(eq(User.username, username), eq(User.status, "active")));
  } catch (error: any) {
    throw new Error(error);
  }
};

/**
 * Saves user login info after successful login
 *
 * `Note: Deletes previous login entry`
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
    throw new Error(error);
  }
};
