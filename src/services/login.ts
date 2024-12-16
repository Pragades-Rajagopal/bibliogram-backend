import { hash, genSalt, compare } from "bcrypt";
import { randomBytes } from "crypto";
import constants from "../config/constants";
import { GeneratePrivateKey } from "../interfaces/user";
const salt = 10;

/**
 * Generates a private key and hashes it
 * @returns {Promise<object>} result
 */
export const generatePrivateKey = async (): Promise<GeneratePrivateKey> => {
  try {
    const privateKey = randomBytes(24).toString("hex");
    const _genSalt = await genSalt(salt);
    const hashedPkey = await hash(privateKey, _genSalt);
    console.log(constants.loginService.hash.success);
    return {
      privateKey: privateKey,
      hashedPKey: hashedPkey,
    };
  } catch (error: any) {
    console.error(constants.loginService.hash.success);
    console.error(error);
    return {
      privateKey: null,
      hashedPKey: null,
    };
  }
};

/**
 * Verify the private key upon user login
 * @param {string} privateKey
 * @param {string} privateKey
 * @returns {Promise} boolean | number
 */
export const verifyCredential = async (
  privateKey: string,
  hashedPrivateKey: string
): Promise<boolean> => {
  try {
    const result = await compare(privateKey, hashedPrivateKey);
    if (result) {
      console.log(constants.loginService.verification.success);
    }
    return result;
  } catch (error: any) {
    console.error(constants.loginService.verification.error);
    console.error(error);
    return false;
  }
};
