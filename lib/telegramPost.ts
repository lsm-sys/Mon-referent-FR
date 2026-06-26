import {
  TELEGRAM_MAX_WORDS,
  TELEGRAM_MIN_WORDS,
} from "@/lib/prompts/telegramPost";

export type ParsedTelegramPost = {
  content: string;
  wordCount: number;
  wordCountNote: string | null;
  hasSourceLink: boolean;
  sourceAppended: boolean;
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getWordCountNote(wordCount: number): string | null {
  if (wordCount < TELEGRAM_MIN_WORDS) {
    return `${wordCount} mots (recommande : ${TELEGRAM_MIN_WORDS}-${TELEGRAM_MAX_WORDS})`;
  }
  if (wordCount > TELEGRAM_MAX_WORDS) {
    return `${wordCount} mots (recommande : ${TELEGRAM_MIN_WORDS}-${TELEGRAM_MAX_WORDS})`;
  }
  return null;
}

function hasSourceReference(content: string, sourceUrl: string): boolean {
  const lower = content.toLowerCase();
  const urlLower = sourceUrl.toLowerCase();

  return (
    lower.includes(urlLower) ||
    /source\s*:/i.test(content)
  );
}

function ensureSourceLine(content: string, sourceUrl: string): {
  content: string;
  appended: boolean;
} {
  if (hasSourceReference(content, sourceUrl)) {
    return { content: content.trim(), appended: false };
  }

  return {
    content: `${content.trim()}\n\nSource : ${sourceUrl}`,
    appended: true,
  };
}

export function parseTelegramPostResponse(
  raw: string,
  sourceUrl: string,
): ParsedTelegramPost {
  const { content, appended } = ensureSourceLine(raw, sourceUrl);
  const wordCount = countWords(content);

  return {
    content,
    wordCount,
    wordCountNote: getWordCountNote(wordCount),
    hasSourceLink: hasSourceReference(content, sourceUrl),
    sourceAppended: appended,
  };
}

export function formatTelegramPostOutput(post: ParsedTelegramPost): string {
  const header = post.wordCountNote
    ? `Post Telegram (${post.wordCountNote})`
    : `Post Telegram (${post.wordCount} mots)`;

  const notes: string[] = [header, post.content];

  if (post.sourceAppended) {
    notes.push(
      "[Note : la ligne Source a ete ajoutee automatiquement.]",
    );
  }

  return notes.join("\n\n");
}

export function validateTelegramPost(post: ParsedTelegramPost): string | null {
  if (!post.content.trim()) {
    return "Le post Telegram est vide.";
  }

  if (!post.hasSourceLink) {
    return "Le post Telegram doit contenir une reference a la source.";
  }

  if (post.wordCount < 200) {
    return `Le post Telegram est trop court (${post.wordCount} mots).`;
  }

  return null;
}
