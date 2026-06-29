import type { AppErrorCode } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/lib/errorMessages";

type ApiJson = Record<string, unknown>;

export async function readApiResponse(response: Response): Promise<ApiJson> {
  try {
    return (await response.json()) as ApiJson;
  } catch {
    return {};
  }
}

export function getApiErrorCode(data: ApiJson): AppErrorCode {
  if (typeof data.code === "string" && data.code in ERROR_MESSAGES) {
    return data.code as AppErrorCode;
  }

  return "UNKNOWN";
}

export type GenerateApiResult =
  | { ok: true; result: string; truncated: boolean }
  | { ok: false; code: AppErrorCode };

export type IllustrationApiResult =
  | {
      ok: true;
      result: string;
      prompt: string;
      imageDataUrl: string;
      truncated: boolean;
    }
  | { ok: false; code: AppErrorCode };

export async function requestGenerate(
  url: string,
  action: string,
): Promise<GenerateApiResult> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, action }),
    });

    const data = await readApiResponse(response);

    if (!response.ok) {
      return { ok: false, code: getApiErrorCode(data) };
    }

    if (typeof data.result !== "string") {
      return { ok: false, code: "UNKNOWN" };
    }

    return {
      ok: true,
      result: data.result,
      truncated: Boolean(data.truncated),
    };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function requestIllustration(
  url: string,
): Promise<IllustrationApiResult> {
  try {
    const response = await fetch("/api/illustrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await readApiResponse(response);

    if (!response.ok) {
      return { ok: false, code: getApiErrorCode(data) };
    }

    if (
      typeof data.result !== "string" ||
      typeof data.prompt !== "string" ||
      typeof data.imageDataUrl !== "string"
    ) {
      return { ok: false, code: "UNKNOWN" };
    }

    return {
      ok: true,
      result: data.result,
      prompt: data.prompt,
      imageDataUrl: data.imageDataUrl,
      truncated: Boolean(data.truncated),
    };
  } catch {
    return { ok: false, code: "UNKNOWN" };
  }
}
