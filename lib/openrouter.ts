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
    throw new Error("OPENROUTER_API_KEY n'est pas configure.");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mon-referent-fr.vercel.app",
      "X-Title": "Mon referent FR",
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
    throw new Error(
      data.error?.message ?? `Erreur OpenRouter (${response.status}).`,
    );
  }

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenRouter n'a pas renvoye de contenu.");
  }

  return content;
}

export { DEEPSEEK_MODEL };
