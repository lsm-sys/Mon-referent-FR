import { InferenceClient } from "@huggingface/inference";
import { AppError } from "@/lib/errors";

const DEFAULT_MODEL = "black-forest-labs/FLUX.1-schnell";

function getModelId(): string {
  return process.env.HUGGINGFACE_MODEL?.trim() || DEFAULT_MODEL;
}

export async function generateImageFromPrompt(
  prompt: string,
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new AppError("IMAGE_GENERATION_FAILED", 502);
  }

  const modelId = getModelId();

  try {
    const client = new InferenceClient(apiKey);

    const imageDataUrl = await client.textToImage(
      {
        model: modelId,
        inputs: prompt,
        provider: "auto",
      },
      {
        outputType: "dataUrl",
        signal: AbortSignal.timeout(120000),
      },
    );

    return imageDataUrl;
  } catch (error) {
    console.error("[huggingface]", error);
    throw new AppError("IMAGE_GENERATION_FAILED", 502);
  }
}
