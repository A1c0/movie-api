const R = require('ramda');
const L = require('loggy-log')(1);

const pino = L.getPino();

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }
}

const throwApiError = R.curry((statusCode, message) => () => {
  const apiError = new ApiError(statusCode, message);
  pino.error(apiError.toString());
  throw apiError;
});

// 404 (NotFound)
const throwNotFoundError = throwApiError(404);
// 409 (Conflict)
const throwConflictError = throwApiError(409);
// 204 (NoContent)
const throwNoContentError = throwApiError(204);

module.exports = {throwNotFoundError, throwConflictError, throwNoContentError};
