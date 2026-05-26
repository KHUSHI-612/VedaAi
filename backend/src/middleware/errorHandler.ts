import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
}

/**
 * Middleware to catch 404 Route Not Found errors.
 * Forwards a CustomError with status code 404 to the global error handler.
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global Express Error Handling Middleware.
 * Catches all unhandled controller exceptions and returns structured JSON errors.
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Global Error Handler] ${req.method} ${req.originalUrl} - Status: ${statusCode}`, err);

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
