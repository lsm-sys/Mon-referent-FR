import { NextResponse } from "next/server";

export type AppErrorCode =
  | "MISSING_URL"
  | "INVALID_URL"
  | "INVALID_ACTION"
  | "ARTICLE_FETCH_FAILED"
  | "ARTICLE_PARSE_FAILED"
  | "AI_GENERATION_FAILED"
  | "AI_RESPONSE_INVALID"
  | "UNKNOWN";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, status: number, message?: string) {
    super(message ?? code);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export type ApiErrorResponse = {
  code: AppErrorCode;
};

export function createApiErrorResponse(
  code: AppErrorCode,
  status: number,
) {
  return NextResponse.json({ code } satisfies ApiErrorResponse, { status });
}

export function resolveAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return new AppError("ARTICLE_FETCH_FAILED", 502, error.message);
    }

    if (error instanceof TypeError) {
      return new AppError("ARTICLE_FETCH_FAILED", 502, error.message);
    }
  }

  return new AppError("UNKNOWN", 500);
}
