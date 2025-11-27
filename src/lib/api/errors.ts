/**
 * API Error Handling
 */

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromResponse(response: Response, details?: unknown): ApiError {
    const status = response.status;
    let message = `API Error: ${response.statusText}`;

    if (status === 401) {
      message = "Unauthorized. Please login again.";
    } else if (status === 403) {
      message = "Forbidden. You don't have permission to access this resource.";
    } else if (status === 404) {
      message = "Resource not found.";
    } else if (status === 500) {
      message = "Server error. Please try again later.";
    }

    return new ApiError(message, status, `HTTP_${status}`, details);
  }

  static fromError(error: Error): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    return new ApiError(error.message || "An unexpected error occurred");
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

