import { Request, Response } from "express";
import constants from "../config/constants";
import * as loginService from "../services/login";
import * as auth from "../services/auth";
import { GeneratePrivateKey } from "../interfaces/user";
import { responseObject } from "../utils/response";
import {
  deactivateUserModel,
  getUserInfoModel,
  saveUserLogin,
  saveUserModel,
  updateUserLogout,
} from "../services/user";

/**
 * Saves user into the system upon registration
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>} endpoint response
 */
export const registerUser = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    let body = request.body;
    const pKeyResult: GeneratePrivateKey =
      await loginService.generatePrivateKey();
    body = { ...body, privateKey: pKeyResult["hashedPKey"] };
    await saveUserModel(body);
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.user.registered, {
        error: null,
        privateKey: pKeyResult["privateKey"]!,
      })
    );
  } catch (error: any) {
    if (error?.message === constants.databaseErrors.constraint) {
      return response.status(constants.statusCode.serverError).json(
        responseObject(constants.statusCode.error, error?.message, {
          error: constants.commonServerError.badRequest,
          code: error?.message,
        })
      );
    }
    return response.status(constants.statusCode.serverError).json(
      responseObject(constants.statusCode.serverError, error?.message, {
        error: constants.commonServerError.internal,
      })
    );
  }
};

/**
 * Logins user
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise}
 */
export const userLogin = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { username, privateKey } = request.body;
    const userInfo: {
      id: string;
      username: string;
      fullname: string;
      privateKey: string;
    }[] = await getUserInfoModel(username);
    if (userInfo.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.user.notRegistered,
            { token: "" }
          )
        );
    }
    const verifyKey: boolean = await loginService.verifyCredential(
      privateKey,
      userInfo[0].privateKey
    );
    if (!verifyKey) {
      return response
        .status(constants.statusCode.unauthorized)
        .json(
          responseObject(
            constants.statusCode.unauthorized,
            constants.user.invalidAuth,
            { token: "" }
          )
        );
    }
    // Generates JWT and saves in database
    const token = auth.generateToken({
      id: userInfo[0].id,
      fullname: userInfo[0].fullname,
      username: userInfo[0].username,
    });
    await saveUserLogin(userInfo[0].id, token);
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, "success", {
        token: token,
      })
    );
  } catch (error: any) {
    return response.status(constants.statusCode.serverError).json(
      responseObject(constants.statusCode.serverError, "", {
        error: error.message,
      })
    );
  }
};

/**
 * User logout component
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise}
 */
export const userLogout = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { userId } = request.params;
    const result: { userId: string }[] = await updateUserLogout(userId);
    if (!result[0]?.userId) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            constants.user.loginNotFound
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.user.logoutSuccess
        )
      );
  } catch (error: any) {
    return response.status(constants.statusCode.serverError).json(
      responseObject(constants.statusCode.serverError, "", {
        error: error.message,
      })
    );
  }
};

/**
 * Deactivate user component
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const deactivateUser = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { userId } = request.params;
    // asset validation
    const _isUserExists: [] = await getUserInfoModel("", userId);
    if (_isUserExists.length === 0) {
      return response.status(constants.statusCode.error).json({
        statusCode: constants.statusCode.error,
        message: constants.assetValidation.userNotExists,
      });
    }
    await deactivateUserModel(userId);
    return response.status(constants.statusCode.success).json({
      statusCode: constants.statusCode.success,
      message: constants.user.deactivationSuccess,
    });
  } catch (error: any) {
    console.error(constants.user.deactivationError);
    console.error(error);
    return response.status(constants.statusCode.serverError).json({
      statusCode: constants.statusCode.serverError,
      message: constants.user.deactivationError,
    });
  }
};
