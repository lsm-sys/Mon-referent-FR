import { NextResponse } from "next/server";
import {
  createApiErrorResponse,
  resolveAppError,
} from "@/lib/errors";
import { generateIllustration } from "@/lib/generateIllustration";
import { parseArticleFromUrl } from "@/lib/parseArticle";

export const runtime = "nodejs";
export const maxDuration = 180;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const url = body.url?.trim() ?? "";

    if (!url) {
      return createApiErrorResponse("MISSING_URL", 400);
    }

    if (!isValidUrl(url)) {
      return createApiErrorResponse("INVALID_URL", 400);
    }

    const article = await parseArticleFromUrl(url);

    if (!article.title && !article.content) {
      return createApiErrorResponse("ARTICLE_PARSE_FAILED", 422);
    }

    const illustration = await generateIllustration(article, url);

    return NextResponse.json({
      url,
      article,
      prompt: illustration.prompt,
      imageDataUrl: illustration.imageDataUrl,
      result: illustration.result,
      truncated: illustration.truncated,
    });
  } catch (error) {
    console.error("[illustrate]", error);
    const appError = resolveAppError(error);
    return createApiErrorResponse(appError.code, appError.status);
  }
}
