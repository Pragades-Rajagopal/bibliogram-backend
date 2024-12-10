import { Request, Response } from "express";
import constants from "../config/constants";
import { IBookmarkNote, INote } from "../interfaces/book";
import {
  deleteBookmarkModel,
  deleteNoteModel,
  getBookmarksModel,
  getNoteModel,
  isNoteBookmarkedModel,
  saveBookmarkModel,
  updateNoteVisibilityModel,
  upsertNoteModel,
} from "../services/note";
import { responseObject } from "../utils/response";

/**
 * Adds or updates note
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const upsertNote = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const body: INote = request.body;
    const result: { id: string }[] = await upsertNoteModel(body);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            constants.note.upsertBadRequest
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.note.upsertSuccess
        )
      );
  } catch (error: any) {
    console.error(constants.note.upsertFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(responseObject(constants.statusCode.serverError, error?.message));
  }
};

/**
 * Gets a book note based on note id
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getNoteById = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const id = request.params.id;
    const data: [] = await getNoteModel(id);
    if (data && data.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.note.notFound,
            { data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.note.found, {
        data: data,
      })
    );
  } catch (error) {
    console.error(constants.note.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.note.getError
        )
      );
  }
};

/**
 * Gets book notes with query
 *
 * * Filter with `book id` or `user id` or both
 * * Paginate with `limit` and `offset`
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<Response>}
 */
export const getNotesByQuery = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { bookId, userId, limit, offset } = request.query;
    const data: [] = await getNoteModel(
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
            constants.note.notFound,
            { count: 0, data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.note.found, {
        count: data.length,
        data: data,
      })
    );
  } catch (error) {
    console.error(constants.note.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.note.getError
        )
      );
  }
};

export const updateNoteVisibility = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { id, flag } = request.params;
    if (
      flag !== constants.note.publicFlag &&
      flag !== constants.note.privateFlag
    ) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(constants.statusCode.error, constants.note.badRequest)
        );
    }
    const result: [{ id: string }] = await updateNoteVisibilityModel(id, flag);
    if (!result[0]?.id) {
      return response.status(constants.statusCode.error).json({
        statusCode: constants.statusCode.error,
        message: constants.assetValidation.noteNotExists,
      });
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.note.updateFlagSuccess
        )
      );
  } catch (error) {
    console.error(constants.note.updateFlagFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.note.updateFlagFailure
        )
      );
  }
};

/**
 * Deletes note
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const deleteNote = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { id } = request.params;
    const result: { id: string }[] = await deleteNoteModel(id);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            constants.assetValidation.noteNotExists
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.note.deleteSuccess
        )
      );
  } catch (error) {
    console.error(constants.note.deleteFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.note.deleteFailure
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
export const bookmarkNote = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const body: IBookmarkNote = request.body;
    const result: { id: string }[] = await saveBookmarkModel(body);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            `${constants.assetValidation.userNotExists} or ${constants.assetValidation.noteNotExists}`
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
 * Deletes note bookmark
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const deleteBookmark = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { noteId, userId } = request.params;
    const result: { noteId: string }[] = await deleteBookmarkModel(
      noteId,
      userId
    );
    if (!result[0]?.noteId) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            `${constants.assetValidation.userNotExists} or ${constants.assetValidation.noteNotExists}`
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
    const { noteId, userId } = request.params;
    const data: [] = await isNoteBookmarkedModel(noteId, userId);
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
