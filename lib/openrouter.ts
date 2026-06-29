import { AppError } from "@/lib/errors";

const OPENROUTER_BASE_URL =
  process.env.OPENAI_BASE_URL ?? "https://openrouter.ai/api/v1";

const DEEPSEEK_MODEL = "deepseek/deepseek-chat";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function chatCompletion(
  messages: ChatMessage[],
  model = DEEPSEEK_MODEL,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new AppError("AI_GENERATION_FAILED", 502);
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mon-referent-fr.vercel.app",
        "X-Title": "Mon-referent-FR",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(120000),
    });

    const data = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      throw new AppError("AI_GENERATION_FAILED", 502);
    }

    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new AppError("AI_GENERATION_FAILED", 502);
    }

    return content;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("AI_GENERATION_FAILED", 502);
  }
}

export { DEEPSEEK_MODEL };
