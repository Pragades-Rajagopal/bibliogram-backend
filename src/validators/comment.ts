import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import constants from "../config/constants";
import { responseObject } from "../utils/response";

export const upsertCommentValidation = [
  body("comment").exists().not().isEmpty().withMessage("comment is mandatory"),
  body("userId")
    .exists()
    .not()
    .isEmpty()
    .withMessage("userId is mandatory and should be an UUID"),
  body("noteId")
    .exists()
    .not()
    .isEmpty()
    .withMessage("noteId is mandatory and should be an UUID"),
  body("id").optional().isUUID().withMessage("id should be an UUID"),
  (request: Request, response: Response, next: NextFunction): any => {
    const validationError = validationResult(request);
    if (!validationError.isEmpty()) {
      return response.status(constants.statusCode.error).json(
        responseObject(constants.statusCode.error, "", {
          error: constants.commonServerError.badRequest,
          validationErrors: validationError.mapped(),
        })
      );
    }
    next();
  },
];

export const idValidation = [
  param("id")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("id is mandatory and should be an UUID"),
  (request: Request, response: Response, next: NextFunction): any => {
    const validationError = validationResult(request);
    if (!validationError.isEmpty()) {
      return response.status(constants.statusCode.error).json(
        responseObject(constants.statusCode.error, "", {
          error: constants.commonServerError.badRequest,
          validationErrors: validationError.mapped(),
        })
      );
    }
    next();
  },
];

export const getCommentByQueryValidation = [
  query("userId").optional().isUUID().withMessage("userId should be an UUID"),
  query("noteId").optional().isUUID().withMessage("noteId should be an UUID"),
  query("limit").optional().isNumeric().withMessage("limit should be a number"),
  query("offset")
    .optional()
    .isNumeric()
    .withMessage("offset should be a number"),
  (request: Request, response: Response, next: NextFunction): any => {
    const validationError = validationResult(request);
    if (!validationError.isEmpty()) {
      return response.status(constants.statusCode.error).json(
        responseObject(constants.statusCode.error, "", {
          error: constants.commonServerError.badRequest,
          validationErrors: validationError.mapped(),
        })
      );
    }
    next();
  },
];
