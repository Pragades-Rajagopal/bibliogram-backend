import { Request, Response } from "express";
import constants from "../config/constants";
import {
  bulkInsertBookModel,
  deleteBookModel,
  getAllBooksModel,
  getBook,
  getTopBooksModel,
} from "../services/book";
import { responseObject } from "../utils/response";

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
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(constants.statusCode.success, constants.books.addSuccess)
      );
  } catch (error: any) {
    console.error(constants.books.addFailure);
    console.error(error);
    if (error?.message === "401") {
      return response
        .status(constants.statusCode.unauthorized)
        .json(
          responseObject(
            constants.statusCode.unauthorized,
            constants.authenticationMessage.unauthorized
          )
        );
    }
    return response
      .status(constants.statusCode.serverError)
      .json(responseObject(constants.statusCode.serverError, error?.message));
  }
};

/**
 * Get all book details
 *
 * * Filter the result using book `name` and `author`
 * * Paginate the result with `limit` and `offset`
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getAllBooks = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { value, limit, offset } = request.query;
    const input = value?.toString();
    console.log(input);

    const result: [] = await getAllBooksModel(
      input!,
      limit as string,
      offset as string
    );
    if (result && result.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.books.notFound,
            { count: 0, data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.books.found, {
        count: result.length,
        data: result,
      })
    );
  } catch (error) {
    console.error(constants.books.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.books.getError
        )
      );
  }
};

/**
 * Get book detail by book id
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getBookById = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const bookId = request.params.id;
    const result: [] = await getBook(bookId);
    if (result && result.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.books.notFound,
            { data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.books.found, {
        data: result,
      })
    );
  } catch (error) {
    console.error(constants.books.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.books.getError
        )
      );
  }
};

/**
 * Gets the top 50 books based on the notes added
 * @param {Request} _
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getTopBooks = async (
  _: Request,
  response: Response
): Promise<any> => {
  try {
    const result = await getTopBooksModel();
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.books.found, {
        count: result.length,
        data: result,
      })
    );
  } catch (error) {
    console.error(constants.books.getTopBooksError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.books.getTopBooksError
        )
      );
  }
};

/**
 * Deletes books in bulk
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const deleteBooks = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { bookIds } = request.body;
    await deleteBookModel(bookIds);
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.books.deleteSuccess
        )
      );
  } catch (error) {
    console.error(constants.books.deleteError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.books.deleteError
        )
      );
  }
};
