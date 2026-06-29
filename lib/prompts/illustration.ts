export const ILLUSTRATION_SYSTEM_PROMPT = [
  "You are an expert prompt engineer for text-to-image models.",
  "Based on a French news article, write ONE detailed image generation prompt in English.",
  "Describe a clear visual scene that captures the article's main theme.",
  "Include style, mood, lighting and composition.",
  "Do not include text, logos, watermarks or readable words in the image.",
  "Return ONLY the prompt text, without quotes, titles or explanations.",
  "Maximum 120 words.",
].join(" ");

export const ILLUSTRATION_USER_PROMPT =
  "Create an image prompt for this French article:";

export const ILLUSTRATION_LOADING_MESSAGE =
  "Creation du prompt et generation de l'illustration...";
