import { Request, Response } from "express";
import constants from "../config/constants";
import { IBookmarkGram, IGram } from "../interfaces/book";
import {
  deleteBookmarkModel,
  deleteGramModel,
  getBookmarksModel,
  getGramModel,
  isGramBookmarkedModel,
  saveBookmarkModel,
  updateGramVisibilityModel,
  upsertGramModel,
} from "../services/gram";
import { responseObject } from "../utils/response";

/**
 * Adds or updates gram
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const upsertGram = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const body: IGram = request.body;
    const result: { id: string }[] = await upsertGramModel(body);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            constants.gram.upsertBadRequest
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.gram.upsertSuccess
        )
      );
  } catch (error: any) {
    console.error(constants.gram.upsertFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(responseObject(constants.statusCode.serverError, error?.message));
  }
};

/**
 * Gets a book gram based on gram id
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getGramById = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const id = request.params.id;
    const data: [] = await getGramModel(id);
    if (data && data.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.gram.notFound,
            { data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.gram.found, {
        data: data,
      })
    );
  } catch (error) {
    console.error(constants.gram.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.gram.getError
        )
      );
  }
};

/**
 * Gets book grams with query
 *
 * * Filter with `book id` or `user id` or both
 * * Paginate with `limit` and `offset`
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getGramsByQuery = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { bookId, userId, limit, offset } = request.query;
    const data: [] = await getGramModel(
      undefined,
      bookId as string,
      userId as string,
      limit as string,
      offset as string
    );
    if (data && data.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.gram.notFound,
            { count: 0, data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.gram.found, {
        count: data.length,
        data: data,
      })
    );
  } catch (error) {
    console.error(constants.gram.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.gram.getError
        )
      );
  }
};

export const updateGramVisibility = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { id, flag } = request.params;
    if (
      flag !== constants.gram.publicFlag &&
      flag !== constants.gram.privateFlag
    ) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(constants.statusCode.error, constants.gram.badRequest)
        );
    }
    const result: [{ id: string }] = await updateGramVisibilityModel(id, flag);
    if (!result[0]?.id) {
      return response.status(constants.statusCode.error).json({
        statusCode: constants.statusCode.error,
        message: constants.assetValidation.gramNotExists,
      });
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.gram.updateFlagSuccess
        )
      );
  } catch (error) {
    console.error(constants.gram.updateFlagFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.gram.updateFlagFailure
        )
      );
  }
};

/**
 * Deletes gram
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const deleteGram = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { id } = request.params;
    const userId: string = request?.userId;
    const result: { id: string }[] = await deleteGramModel(id, userId);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            `${constants.assetValidation.gramNotExists} or ${constants.authenticationMessage.unauthorized}`
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.gram.deleteSuccess
        )
      );
  } catch (error) {
    console.error(constants.gram.deleteFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.gram.deleteFailure
        )
      );
  }
};

/**
 * Saves bookmark
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const bookmarkGram = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const body: IBookmarkGram = request.body;
    const result: { id: string }[] = await saveBookmarkModel(body);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            `${constants.assetValidation.userNotExists} or ${constants.assetValidation.gramNotExists}`
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.bookmark.addSuccess
        )
      );
  } catch (error: any) {
    console.error(constants.bookmark.addFailure);
    console.error(error);
    return response.status(constants.statusCode.error).json(
      responseObject(constants.statusCode.error, error?.message, {
        error: constants.commonServerError.badRequest,
      })
    );
  }
};

/**
 * Get bookmarks for an user
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const getBookmarks = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const userId = request.params.id;
    const data: [] = await getBookmarksModel(userId);
    if (data && data.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.bookmark.notFound,
            { count: 0, data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.bookmark.found, {
        count: data.length,
        data: data,
      })
    );
  } catch (error) {
    console.error(constants.bookmark.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.bookmark.getError
        )
      );
  }
};

/**
 * Deletes gram bookmark
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const deleteBookmark = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { gramId, userId } = request.params;
    const result: { gramId: string }[] = await deleteBookmarkModel(
      gramId,
      userId
    );
    if (!result[0]?.gramId) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            `${constants.assetValidation.userNotExists} or ${constants.assetValidation.gramNotExists}`
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.bookmark.deleteSuccess
        )
      );
  } catch (error) {
    console.error(constants.bookmark.deleteError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.bookmark.deleteError
        )
      );
  }
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const isBookmarked = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { gramId, userId } = request.params;
    const data: [] = await isGramBookmarkedModel(gramId, userId);
    if (data && data.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.bookmark.notFound,
            { count: 0 }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.bookmark.found, {
        count: 1,
      })
    );
  } catch (error) {
    console.error(constants.bookmark.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.bookmark.getError,
          { count: undefined }
        )
      );
  }
};
