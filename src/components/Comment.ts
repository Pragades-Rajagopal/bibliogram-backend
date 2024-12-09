import { Request, Response } from "express";
import { IComment } from "../interfaces/book";
import {
  deleteCommentModel,
  getCommentModel,
  upsertCommentModel,
} from "../services/comment";
import constants from "../config/constants";
import { responseObject } from "../utils/response";

/**
 * Adds or updates comment to a note
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const upsertComment = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const body: IComment = request.body;
    await upsertCommentModel(body);
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.comment.addSuccess
        )
      );
  } catch (error: any) {
    console.error(constants.comment.addOrUpdateFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(responseObject(constants.statusCode.serverError, error?.message));
  }
};

/**
 * Gets a comment based on comment id
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const getCommentById = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const id = request.params.id;
    const data: [] = await getCommentModel(id);
    if (data && data.length === 0) {
      return response
        .status(constants.statusCode.notFound)
        .json(
          responseObject(
            constants.statusCode.notFound,
            constants.comment.notFound,
            { data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.comment.found, {
        data: data,
      })
    );
  } catch (error) {
    console.error(constants.comment.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.comment.getError
        )
      );
  }
};

/**
 * Gets comment with query
 *
 * * Filter with `note id` or `user id` or both
 * * Paginate with `limit` and `offset`
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const getCommentByQuery = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { noteId, userId, limit, offset } = request.query;
    const data: [] = await getCommentModel(
      undefined,
      noteId as string,
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
            constants.comment.notFound,
            { count: 0, data: [] }
          )
        );
    }
    return response.status(constants.statusCode.success).json(
      responseObject(constants.statusCode.success, constants.comment.found, {
        count: data.length,
        data: data,
      })
    );
  } catch (error) {
    console.error(constants.comment.getError);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.comment.getError
        )
      );
  }
};

/**
 * Deletes comment
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const deleteComment = async (
  request: Request,
  response: Response
): Promise<any> => {
  try {
    const { id } = request.params;
    const result: { id: string }[] = await deleteCommentModel(id);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            constants.assetValidation.commentNotExists
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.comment.deleteSuccess
        )
      );
  } catch (error) {
    console.error(constants.comment.deleteFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(
        responseObject(
          constants.statusCode.serverError,
          constants.comment.deleteFailure
        )
      );
  }
};
