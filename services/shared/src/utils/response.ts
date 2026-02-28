import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: any;
  timestamp: string;
}

export class ResponseFormatter {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    error?: string,
    errors?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      errors,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  static updated<T>(res: Response, data: T, message = 'Resource updated successfully'): Response {
    return this.success(res, data, message, 200);
  }

  static deleted(res: Response, message = 'Resource deleted successfully'): Response {
    return this.success(res, null, message, 200);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message = 'Unauthorized access'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden access'): Response {
    return this.error(res, message, 403);
  }

  static badRequest(res: Response, message = 'Bad request', errors?: any): Response {
    return this.error(res, message, 400, undefined, errors);
  }

  static conflict(res: Response, message = 'Resource conflict'): Response {
    return this.error(res, message, 409);
  }

  static serverError(res: Response, message = 'Internal server error', error?: string): Response {
    return this.error(res, message, 500, error);
  }
}
