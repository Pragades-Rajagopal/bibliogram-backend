import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import constants from "../config/constants";
import { responseObject } from "../utils/response";

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
  body("role")
    .optional()
    .custom((value) => {
      if (value !== "admin" && value !== "user") {
        throw new Error("role can only take 'admin' or 'user'");
      }
      return true;
    }),
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

export const deactivateUserValidation = [
  param("userId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("userId is mandatory and should be an UUID"),
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

export const logoutValidation = [
  param("userId")
    .exists()
    .not()
    .isEmpty()
    .isUUID()
    .withMessage("userId is mandatory and should be an UUID"),
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
