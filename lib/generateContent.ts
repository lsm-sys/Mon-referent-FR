import type { ActionType } from "@/app/types";
import { formatArticleSource } from "@/lib/formatArticle";
import type { ParsedArticle } from "@/lib/parseArticle";
import { chatCompletion } from "@/lib/openrouter";
import { SYSTEM_PROMPTS } from "@/lib/prompts";
import {
  X_POSTS_SYSTEM_PROMPT,
  X_POSTS_USER_PROMPT,
} from "@/lib/prompts/xPosts";
import {
  INSTAGRAM_POSTS_SYSTEM_PROMPT,
  INSTAGRAM_POSTS_USER_PROMPT,
} from "@/lib/prompts/instagramPosts";
import {
  INSTAGRAM_INFOGRAPHICS_SYSTEM_PROMPT,
  INSTAGRAM_INFOGRAPHICS_USER_PROMPT,
} from "@/lib/prompts/instagramInfographics";
import {
  formatInstagramInfographicsOutput,
  parseInstagramInfographicsResponse,
  validateInstagramInfographics,
} from "@/lib/instagramInfographics";
import {
  formatInstagramPostsOutput,
  parseInstagramPostsResponse,
  validateInstagramPosts,
} from "@/lib/instagramPosts";
import {
  formatXPostsOutput,
  parseXPostsResponse,
  validateXPosts,
} from "@/lib/xPosts";
import {
  formatTelegramPostOutput,
  parseTelegramPostResponse,
  validateTelegramPost,
} from "@/lib/telegramPost";
import {
  TELEGRAM_POST_SYSTEM_PROMPT,
  TELEGRAM_POST_USER_PROMPT,
} from "@/lib/prompts/telegramPost";

export type GenerateContentResult = {
  content: string;
  truncated: boolean;
};

function buildUserMessage(
  article: ParsedArticle,
  sourceUrl: string,
  action: ActionType,
): string {
  const { text } = formatArticleSource(article);
  const actionHint =
    action === "telegram"
      ? `\n\nURL de l'article : ${sourceUrl}`
      : "";

  return `Voici l'article a transformer:\n\n${text}${actionHint}`;
}

export async function generateContent(
  article: ParsedArticle,
  action: ActionType,
  sourceUrl: string,
): Promise<GenerateContentResult> {
  const { text, truncated } = formatArticleSource(article);

  if (!text.trim()) {
    throw new Error("Aucun contenu a generer.");
  }

  const content = await chatCompletion([
    { role: "system", content: SYSTEM_PROMPTS[action] },
    {
      role: "user",
      content: buildUserMessage(article, sourceUrl, action),
    },
  ]);

  return { content, truncated };
}

export async function generatePostsForX(
  article: ParsedArticle,
  sourceUrl: string,
): Promise<GenerateContentResult> {
  const { text, truncated } = formatArticleSource(article);

  if (!text.trim()) {
    throw new Error("Aucun contenu a generer.");
  }

  const raw = await chatCompletion([
    { role: "system", content: X_POSTS_SYSTEM_PROMPT },
    {
      role: "user",
      content: `${X_POSTS_USER_PROMPT}\n\nSource : ${sourceUrl}\n\n${text}`,
    },
  ]);

  const parsed = parseXPostsResponse(raw);
  const validationError = validateXPosts(parsed);

  if (validationError) {
    throw new Error(validationError);
  }

  const formatted = formatXPostsOutput(parsed);

  return { content: formatted, truncated };
}

export async function generatePostsForInstagram(
  article: ParsedArticle,
  sourceUrl: string,
): Promise<GenerateContentResult> {
  const { text, truncated } = formatArticleSource(article);

  if (!text.trim()) {
    throw new Error("Aucun contenu a generer.");
  }

  const raw = await chatCompletion([
    { role: "system", content: INSTAGRAM_POSTS_SYSTEM_PROMPT },
    {
      role: "user",
      content: `${INSTAGRAM_POSTS_USER_PROMPT}\n\nSource : ${sourceUrl}\n\n${text}`,
    },
  ]);

  const parsed = parseInstagramPostsResponse(raw);
  const validationError = validateInstagramPosts(parsed);

  if (validationError) {
    throw new Error(validationError);
  }

  const formatted = formatInstagramPostsOutput(parsed);

  return { content: formatted, truncated };
}

export async function generateInfographicsForInstagram(
  article: ParsedArticle,
  sourceUrl: string,
): Promise<GenerateContentResult> {
  const { text, truncated } = formatArticleSource(article);

  if (!text.trim()) {
    throw new Error("Aucun contenu a generer.");
  }

  const raw = await chatCompletion([
    { role: "system", content: INSTAGRAM_INFOGRAPHICS_SYSTEM_PROMPT },
    {
      role: "user",
      content: `${INSTAGRAM_INFOGRAPHICS_USER_PROMPT}\n\nSource : ${sourceUrl}\n\n${text}`,
    },
  ]);

  const parsed = parseInstagramInfographicsResponse(raw);
  const validationError = validateInstagramInfographics(parsed);

  if (validationError) {
    throw new Error(validationError);
  }

  const formatted = formatInstagramInfographicsOutput(parsed);

  return { content: formatted, truncated };
}

export async function generatePostForTelegram(
  article: ParsedArticle,
  sourceUrl: string,
): Promise<GenerateContentResult> {
  const { text, truncated } = formatArticleSource(article);

  if (!text.trim()) {
    throw new Error("Aucun contenu a generer.");
  }

  const raw = await chatCompletion([
    { role: "system", content: TELEGRAM_POST_SYSTEM_PROMPT },
    {
      role: "user",
      content: `${TELEGRAM_POST_USER_PROMPT}\n\nURL de l'article : ${sourceUrl}\n\n${text}`,
    },
  ]);

  const parsed = parseTelegramPostResponse(raw, sourceUrl);
  const validationError = validateTelegramPost(parsed);

  if (validationError) {
    throw new Error(validationError);
  }

  const formatted = formatTelegramPostOutput(parsed);

  return { content: formatted, truncated };
}
