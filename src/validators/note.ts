import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import constants from "../config/constants";
import { responseObject } from "../utils/response";

export const addOrUpdateValidation = [
  body("note").exists().not().isEmpty().withMessage("note is mandatory"),
  body("userId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("userId is mandatory"),
  body("bookId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("bookId is mandatory"),
  body("isPrivate")
    .exists()
    .not()
    .isEmpty()
    .isBoolean()
    .withMessage("isPrivate is mandatory"),
  body("noteId").optional().isUUID(),
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

export const updateVisibilityValidation = [
  param("id")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("id is mandatory and should be an UUID"),
  param("flag").custom((value) => {
    if (
      value !== constants.note.privateFlag ||
      value !== constants.note.publicFlag
    ) {
      return "flag can only take 'private' or 'public'";
    }
  }),
  body("noteId").optional().isUUID(),
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

export const getNotesByQueryValidation = [
  query("userId").optional().isUUID().withMessage("userId should be an UUID"),
  query("bookId").optional().isUUID().withMessage("bookId should be an UUID"),
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

export const saveBookmarkValidation = [
  body("userId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("userId is mandatory and should be an UUID"),
  body("noteId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("noteId is mandatory and should be an UUID"),
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
