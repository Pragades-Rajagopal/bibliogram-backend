import { Request, Response } from "express";
import constants from "../config/constants";
import { getStats } from "../services/appStats";
import { responseObject } from "../utils/response";

/**
 * Get app stats
 *
 * * For displaying stats in app basepage
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const getAppStats = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const userId = request.userId;
    const result: [] = await getStats(userId);
    if (result && result.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.appStats.notFound,
            { data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.appStats.found, {
        data: result,
      })
    );
  } catch (error) {
    console.error(constants.appStats.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.appStats.getError
        )
      );
  }
};
