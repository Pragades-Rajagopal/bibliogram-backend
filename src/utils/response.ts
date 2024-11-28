export const responseObject = (
  statusCode: number,
  message: string,
  optional?: {
    data?: any;
    error?: any;
    privateKey?: string;
    token?: string;
    code?: number;
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
  };
};
