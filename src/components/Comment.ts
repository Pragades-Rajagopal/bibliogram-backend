import { Request, Response } from "express";
import { IComment } from "../interfaces/book";
import {
  deleteCommentModel,
  getCommentModel,
  upsertCommentModel,
} from "../services/comment";
import constants from "../config/constants";
import { responseObject } from "../utils/response";
import { GetCommentByQueryResponse } from "../interfaces/comment";

/**
 * Adds or updates comment to a gram
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
    const result: { id: string }[] = await upsertCommentModel(body);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            constants.comment.upsertBadRequest
          )
        );
    }
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(
          constants.statusCode.success,
          constants.comment.updateSuccess
        )
      );
  } catch (error: any) {
    console.error(constants.comment.upsertFailure);
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
    const data: GetCommentByQueryResponse = await getCommentModel(id);
    if (data && data.totalRecords[0].count === 0) {
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
        data: data.data,
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
 * * Filter with `gram id` or `user id` or both
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
    const { gramId, userId, limit, offset } = request.query;
    const result: GetCommentByQueryResponse = await getCommentModel(
      undefined,
      gramId as string,
      userId as string,
      limit as string,
      offset as string
    );
    if (result && result.data.length === 0) {
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
        count: result.totalRecords[0].count,
        data: result.data,
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
    const userId: string = request?.userId;
    const result: { id: string }[] = await deleteCommentModel(id, userId);
    if (!result[0]?.id) {
      return response
        .status(constants.statusCode.error)
        .json(
          responseObject(
            constants.statusCode.error,
            `${constants.assetValidation.commentNotExists} or ${constants.authenticationMessage.unauthorized}`
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
