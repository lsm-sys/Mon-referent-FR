import { NextResponse } from "next/server";
import { parseArticleFromUrl } from "@/lib/parseArticle";
import { translateArticle } from "@/lib/translateArticle";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { url?: string };
  const url = body.url?.trim() ?? "";

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

    const translation = await translateArticle(article);

    return NextResponse.json({ url, article, result: translation });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la traduction.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
