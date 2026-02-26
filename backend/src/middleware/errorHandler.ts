import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../utils/http.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message, err.stack);

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
};
