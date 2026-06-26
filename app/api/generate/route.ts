import { NextResponse } from "next/server";
import type { ActionType } from "@/app/types";
import {
  generateInfographicsForInstagram,
  generatePostForTelegram,
  generatePostsForInstagram,
  generatePostsForX,
} from "@/lib/generateContent";
import { parseArticleFromUrl } from "@/lib/parseArticle";
import { ACTION_LABELS } from "@/lib/prompts";

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

  throw new Error("Action non reconnue.");
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    url?: string;
    action?: ActionType;
  };

  const url = body.url?.trim() ?? "";
  const action = body.action;

  if (!url) {
    return NextResponse.json(
      { error: "Veuillez saisir l'URL de l'article." },
      { status: 400 },
    );
  }

  if (!isValidUrl(url)) {
    return NextResponse.json(
      { error: "L'URL saisie n'est pas valide." },
      { status: 400 },
    );
  }

  if (!action || !(action in ACTION_LABELS)) {
    return NextResponse.json(
      { error: "Action non reconnue." },
      { status: 400 },
    );
  }

  try {
    const article = await parseArticleFromUrl(url);

    if (!article.title && !article.content) {
      return NextResponse.json(
        {
          error:
            "Impossible d'extraire le titre ou le contenu de cette page.",
        },
        { status: 422 },
      );
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
    console.error(`[generate/${action}]`, error);

    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la generation du contenu.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
