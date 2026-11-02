/**
 * Typed HTTP errors shared by every module controller.
 * Controllers throw these; a single Elysia `onError` hook maps them
 * to `{ message }` responses so route handlers stay lean (SRP).
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request.") {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized. Please log in.") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Access denied.") {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found.") {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict.") {
    super(409, message);
  }
}

export class RateLimitError extends HttpError {
  constructor(message = "Rate limit exceeded. Try again later.") {
    super(429, message);
  }
}

/** Legacy shape returned by services: `{ status, message }`. */
export interface ServiceFailure {
  status: number;
  message: string;
}

export function isServiceFailure(value: unknown): value is ServiceFailure {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["status"] === "number" &&
    typeof record["message"] === "string"
  );
}

/** Throw the legacy `{ status, message }` union as an HttpError. */
export function throwIfFailure<T>(value: T | ServiceFailure): T {
  if (isServiceFailure(value)) throw new HttpError(value.status, value.message);
  return value;
}
