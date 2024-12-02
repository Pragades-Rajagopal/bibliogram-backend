import { Request, Response } from "express";
import constants from "../config/constants";
import { bulkInsertBookModel } from "../services/book";

/**
 * Add books in bulk
 *
 * Will be called from the model daily to load new books
 * @param {Request} request
 * @param {Reponse} response
 * @returns {Promise<Response>}
 */
export const bulkAddBooks = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { data } = request.body;
    await bulkInsertBookModel(data, request.userId);
    return response.status(constants.statusCode.success).json({
      statusCode: constants.statusCode.success,
      message: constants.books.addSuccess,
    });
  } catch (error) {
    console.error(constants.books.addFailure);
    console.error(error);
    return response.status(constants.statusCode.serverError).json({
      statusCode: constants.statusCode.serverError,
      message: constants.books.addFailure,
    });
  }
};
