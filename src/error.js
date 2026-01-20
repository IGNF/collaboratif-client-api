export const ErrorCode = {
  BASE_URL_MISSING: 'BASE_URL_MISSING',
  CLIENT_ID_MISSING: 'CLIENT_ID_MISSING',
  CLIENT_SECRET_MISSING: 'CLIENT_SECRET_MISSING',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

export class ApiError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code; // ErrorCode
    this.originalError = originalError;
  }
}