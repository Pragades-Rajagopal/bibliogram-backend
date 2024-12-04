import { ValidationError } from "express-validator";

export const responseObject = (
  statusCode: number,
  message: string,
  optional?: {
    data?: any;
    error?: any;
    privateKey?: string;
    token?: string;
    code?: number;
    count?: number;
    validationErrors?: Record<string, ValidationError>;
  }
) => {
  return {
    statusCode,
    message,
    error: optional?.error,
    data: optional?.data,
    privateKey: optional?.privateKey,
    token: optional?.token,
    code: optional?.code,
    count: optional?.count,
    validationErrors: optional?.validationErrors,
  };
};
