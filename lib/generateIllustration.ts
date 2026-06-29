import { formatArticleSource } from "@/lib/formatArticle";
import { AppError } from "@/lib/errors";
import { generateImageFromPrompt } from "@/lib/huggingface";
import { chatCompletion } from "@/lib/openrouter";
import {
  ILLUSTRATION_SYSTEM_PROMPT,
  ILLUSTRATION_USER_PROMPT,
} from "@/lib/prompts/illustration";
import type { ParsedArticle } from "@/lib/parseArticle";

export type IllustrationResult = {
  prompt: string;
  imageDataUrl: string;
  result: string;
  truncated: boolean;
};

export async function generateIllustration(
  article: ParsedArticle,
  sourceUrl: string,
): Promise<IllustrationResult> {
  const { text, truncated } = formatArticleSource(article);

  if (!text.trim()) {
    throw new AppError("ARTICLE_PARSE_FAILED", 422);
  }

  const prompt = await chatCompletion([
    { role: "system", content: ILLUSTRATION_SYSTEM_PROMPT },
    {
      role: "user",
      content: `${ILLUSTRATION_USER_PROMPT}\n\nSource: ${sourceUrl}\n\n${text}`,
    },
  ]);

  const imageDataUrl = await generateImageFromPrompt(prompt);

  const result = [
    "Prompt pour l'illustration :",
    prompt,
    "",
    "Illustration generee avec succes.",
  ].join("\n");

  return {
    prompt,
    imageDataUrl,
    result,
    truncated,
  };
}
