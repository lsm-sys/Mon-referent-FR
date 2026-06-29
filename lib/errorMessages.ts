import type { AppErrorCode } from "@/lib/errors";

export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  MISSING_URL: "Введите ссылку на статью.",
  INVALID_URL: "Введите корректную ссылку на статью.",
  INVALID_ACTION: "Выберите действие для генерации.",
  ARTICLE_FETCH_FAILED: "Не удалось загрузить статью по этой ссылке.",
  ARTICLE_PARSE_FAILED:
    "Не удалось извлечь текст статьи. Попробуйте другую ссылку.",
  AI_GENERATION_FAILED:
    "Не удалось сгенерировать контент. Попробуйте позже.",
  AI_RESPONSE_INVALID:
    "Не удалось обработать ответ. Попробуйте ещё раз.",
  UNKNOWN: "Произошла ошибка. Попробуйте позже.",
};

export function getErrorMessage(code: AppErrorCode | null | undefined): string {
  if (!code || !(code in ERROR_MESSAGES)) {
    return ERROR_MESSAGES.UNKNOWN;
  }

  return ERROR_MESSAGES[code];
}

export function parseApiErrorCode(value: unknown): AppErrorCode {
  if (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof value.code === "string" &&
    value.code in ERROR_MESSAGES
  ) {
    return value.code as AppErrorCode;
  }

  return "UNKNOWN";
}
