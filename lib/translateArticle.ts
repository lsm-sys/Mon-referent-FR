import type { ParsedArticle } from "@/lib/parseArticle";
import { AppError } from "@/lib/errors";
import { formatArticleSource } from "@/lib/formatArticle";
import { chatCompletion } from "@/lib/openrouter";

export async function translateArticle(
  article: ParsedArticle,
): Promise<string> {
  const { text } = formatArticleSource(article);

  if (!text.trim()) {
    throw new AppError("ARTICLE_PARSE_FAILED", 422);
  }

  return chatCompletion([
    {
      role: "system",
      content:
        "Tu es un traducteur professionnel. Traduis les articles du francais vers le russe. " +
        "Conserve la date telle quelle. Traduis le titre et le contenu avec precision et style naturel. " +
        "Reponds uniquement en russe, sans commentaires ni explications.",
    },
    {
      role: "user",
      content: `Traduis cet article en russe:\n\n${text}`,
    },
  ]);
}
