import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import constants from "../config/constants";
import { responseObject } from "../utils/response";

export const searchValidation = [
  query("value").exists().not().isEmpty().withMessage("value is mandatory"),
  // query("limit").optional().isNumeric().withMessage("limit should be a number"),
  // query("offset")
  //   .optional()
  //   .isNumeric()
  //   .withMessage("offset should be a number"),
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
