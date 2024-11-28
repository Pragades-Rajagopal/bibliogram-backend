import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import constants from "../config/constants";

export const registerValidation = [
  body("fullname")
    .exists()
    .not()
    .isEmpty()
    .withMessage("fullname is mandatory"),
  body("username")
    .exists()
    .not()
    .isEmpty()
    .withMessage("username is mandatory"),
  (request: Request, response: Response, next: NextFunction): any => {
    const validationError = validationResult(request);
    if (!validationError.isEmpty()) {
      return response.status(constants.statusCode.error).json({
        statusCode: constants.statusCode.error,
        message: validationError.mapped(),
        error: constants.commonServerError.badRequest,
      });
    }
    next();
  },
];

export const loginValidation = [
  body("username")
    .exists()
    .not()
    .isEmpty()
    .withMessage("username is mandatory"),
  body("privateKey")
    .exists()
    .not()
    .isEmpty()
    .withMessage("privateKey is mandatory"),
  (request: Request, response: Response, next: NextFunction): any => {
    const validationError = validationResult(request);
    if (!validationError.isEmpty()) {
      return response.status(constants.statusCode.error).json({
        statusCode: constants.statusCode.error,
        message: validationError.mapped(),
        error: constants.commonServerError.badRequest,
      });
    }
    next();
  },
];

export const deactivateUserValidation = [
  body("userId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("userId is mandatory and should be an UUID"),
  (request: Request, response: Response, next: NextFunction): any => {
    const validationError = validationResult(request);
    if (!validationError.isEmpty()) {
      return response.status(constants.statusCode.error).json({
        statusCode: constants.statusCode.error,
        message: validationError.mapped(),
        error: constants.commonServerError.badRequest,
      });
    }
    next();
  },
];

export const logoutValidation = [
  body("userId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("userId is mandatory and should be an UUID"),
  (request: Request, response: Response, next: NextFunction): any => {
    const validationError = validationResult(request);
    if (!validationError.isEmpty()) {
      return response.status(constants.statusCode.error).json({
        statusCode: constants.statusCode.error,
        message: validationError.mapped(),
        error: constants.commonServerError.badRequest,
      });
    }
    next();
  },
];
