import type { ParsedArticle } from "@/lib/parseArticle";

export const MAX_CONTENT_LENGTH = 12000;

export type FormattedArticle = {
  text: string;
  truncated: boolean;
};

function truncate(text: string | null): { value: string; truncated: boolean } {
  if (!text) return { value: "", truncated: false };
  if (text.length <= MAX_CONTENT_LENGTH) {
    return { value: text, truncated: false };
  }
  return {
    value: `${text.slice(0, MAX_CONTENT_LENGTH)}…`,
    truncated: true,
  };
}

export function formatArticleSource(article: ParsedArticle): FormattedArticle {
  const content = truncate(article.content);
  const parts = [
    article.date ? `Date: ${article.date}` : null,
    article.title ? `Titre: ${article.title}` : null,
    article.content ? `Contenu:\n${content.value}` : null,
  ].filter(Boolean);

  return {
    text: parts.join("\n\n"),
    truncated: content.truncated,
  };
}
