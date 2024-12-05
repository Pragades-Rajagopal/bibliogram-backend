import { body, check, param, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import constants from "../config/constants";
import { responseObject } from "../utils/response";

export const addBooksValidation = [
  body("data").isArray(),
  body("data.*.name").exists().not().isEmpty().withMessage("name is mandatory"),
  body("data.*.author")
    .exists()
    .not()
    .isEmpty()
    .withMessage("author is mandatory"),
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

export const getBookByIdValidation = [
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

export const deleteBooksValidation = [
  body("bookIds").isArray().exists().not().isEmpty().isUUID(),
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
