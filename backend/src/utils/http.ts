import { StatusCodes } from 'http-status-codes';

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound = (message = 'Resource not found') => new HttpError(StatusCodes.NOT_FOUND, message);
export const forbidden = (message = 'Forbidden') => new HttpError(StatusCodes.FORBIDDEN, message);
export const badRequest = (message = 'Bad request') => new HttpError(StatusCodes.BAD_REQUEST, message);
export const unauthorized = (message = 'Unauthorized') => new HttpError(StatusCodes.UNAUTHORIZED, message);
export const tooManyRequests = (message = 'Too many requests') => new HttpError(StatusCodes.TOO_MANY_REQUESTS, message);
