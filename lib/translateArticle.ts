import type { ParsedArticle } from "@/lib/parseArticle";
import { chatCompletion } from "@/lib/openrouter";

const MAX_CONTENT_LENGTH = 12000;

function truncate(text: string | null): string {
  if (!text) return "";
  if (text.length <= MAX_CONTENT_LENGTH) return text;
  return `${text.slice(0, MAX_CONTENT_LENGTH)}…`;
}

export async function translateArticle(
  article: ParsedArticle,
): Promise<string> {
  const source = [
    article.date ? `Date: ${article.date}` : null,
    article.title ? `Titre: ${article.title}` : null,
    article.content ? `Contenu:\n${truncate(article.content)}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  if (!source.trim()) {
    throw new Error("Aucun contenu a traduire.");
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
      content: `Traduis cet article en russe:\n\n${source}`,
    },
  ]);
}
