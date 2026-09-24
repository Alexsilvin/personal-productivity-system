export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function buildValidationErrorDetails(issues: Array<{ path: (string | number)[]; message: string }>) {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'request',
    message: issue.message,
  }));
}
