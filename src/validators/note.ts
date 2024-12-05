import { body, validationResult } from "express-validator";
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

export const saveNoteForLaterValidation = [
  body("userId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("userId is mandatory"),
  body("noteId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("noteId is mandatory"),
  (request: Request, response: Response, next: NextFunction) => {
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
