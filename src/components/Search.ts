import { Request, Response } from "express";
import constants from "../config/constants";
import { searchModel } from "../services/search";
import { responseObject } from "../utils/response";

/**
 * Search component
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const globalSearch = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { value } = request.query;
    console.log(`Searching for... ${value}`);
    const data: [] = await searchModel(value as string);
    if (data.length === 0) {
      return response.status(constants.statusCode.notFound).json(
        responseObject(
          constants.statusCode.notFound,
          constants.search.notData,
          {
            count: 0,
            data: [],
          }
        )
      );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.search.success, {
        count: data.length,
        data: data,
      })
    );
  } catch (error) {
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(constants.statusCode.serverError, constants.search.error)
      );
  }
};
