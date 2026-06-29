import { NextResponse } from "next/server";
import type { ActionType } from "@/app/types";
import {
  AppError,
  createApiErrorResponse,
  resolveAppError,
} from "@/lib/errors";
import {
  generateInfographicsForInstagram,
  generatePostForTelegram,
  generatePostsForInstagram,
  generatePostsForX,
} from "@/lib/generateContent";
import { parseArticleFromUrl } from "@/lib/parseArticle";
import { ACTION_LABELS } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 120;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function runGeneration(
  action: ActionType,
  article: Awaited<ReturnType<typeof parseArticleFromUrl>>,
  url: string,
) {
  if (action === "x") {
    return generatePostsForX(article, url);
  }

  if (action === "instagram-posts") {
    return generatePostsForInstagram(article, url);
  }

  if (action === "instagram-infographics") {
    return generateInfographicsForInstagram(article, url);
  }

  if (action === "telegram") {
    return generatePostForTelegram(article, url);
  }

  throw new AppError("INVALID_ACTION", 400);
}

export async function POST(request: Request) {
  let action: ActionType | undefined;

  try {
    const body = (await request.json()) as {
      url?: string;
      action?: ActionType;
    };

    const url = body.url?.trim() ?? "";
    action = body.action;

    if (!url) {
      return createApiErrorResponse("MISSING_URL", 400);
    }

    if (!isValidUrl(url)) {
      return createApiErrorResponse("INVALID_URL", 400);
    }

    if (!action || !(action in ACTION_LABELS)) {
      return createApiErrorResponse("INVALID_ACTION", 400);
    }

    const article = await parseArticleFromUrl(url);

    if (!article.title && !article.content) {
      return createApiErrorResponse("ARTICLE_PARSE_FAILED", 422);
    }

    const { content, truncated } = await runGeneration(action, article, url);

    return NextResponse.json({
      action,
      url,
      article,
      result: content,
      truncated,
    });
  } catch (error) {
    const appError = resolveAppError(error);
    console.error(`[generate/${action ?? "unknown"}]`, error);
    return createApiErrorResponse(appError.code, appError.status);
  }
}
