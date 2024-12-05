import { Request, Response } from "express";
import constants from "../config/constants";
import { INote } from "../interfaces/book";
import { upsertNoteModel } from "../services/note";
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
    await upsertNoteModel(body);
    return response
      .status(constants.statusCode.success)
      .json(
        responseObject(constants.statusCode.success, constants.note.addSuccess)
      );
  } catch (error: any) {
    console.error(constants.note.addOrUpdateFailure);
    console.error(error);
    return response
      .status(constants.statusCode.serverError)
      .json(responseObject(constants.statusCode.serverError, error?.message));
  }
};
