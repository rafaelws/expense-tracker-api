export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`);
  }
}

export class InvalidParameterError extends AppError {
  constructor(
    public readonly parameter: string,
    public readonly details?: string,
  ) {
    super(`Invalid parameter '${parameter}'${details ? ": " + details : ""}`);
  }
}
