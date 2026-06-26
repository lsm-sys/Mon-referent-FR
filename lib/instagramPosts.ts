import {
  INSTAGRAM_MAX_HASHTAGS,
  INSTAGRAM_MAX_POSTS,
  INSTAGRAM_MAX_WORDS,
  INSTAGRAM_MIN_HASHTAGS,
  INSTAGRAM_MIN_WORDS,
} from "@/lib/prompts/instagramPosts";

export type InstagramPost = {
  number: number;
  caption: string;
  wordCount: number;
  hashtags: string;
  hashtagCount: number;
  wordCountNote: string | null;
};

export type ParsedInstagramPosts = {
  posts: InstagramPost[];
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countHashtags(text: string): number {
  return (text.match(/#\w+/g) ?? []).length;
}

function getWordCountNote(wordCount: number): string | null {
  if (wordCount < INSTAGRAM_MIN_WORDS) {
    return `${wordCount} mots (recommande : ${INSTAGRAM_MIN_WORDS}-${INSTAGRAM_MAX_WORDS})`;
  }
  if (wordCount > INSTAGRAM_MAX_WORDS) {
    return `${wordCount} mots (recommande : ${INSTAGRAM_MIN_WORDS}-${INSTAGRAM_MAX_WORDS})`;
  }
  return null;
}

export function parseInstagramPostsResponse(raw: string): ParsedInstagramPosts {
  const lines = raw.split("\n");
  const posts: InstagramPost[] = [];

  let currentNumber: number | null = null;
  let captionLines: string[] = [];
  let hashtags = "";
  let mode: "caption" | "hashtags" = "caption";

  function pushCurrentPost() {
    if (currentNumber === null) return;

    const caption = captionLines.join("\n").trim();
    if (!caption) return;

    const wordCount = countWords(caption);
    const hashtagCount = countHashtags(hashtags);

    posts.push({
      number: currentNumber,
      caption,
      wordCount,
      hashtags,
      hashtagCount,
      wordCountNote: getWordCountNote(wordCount),
    });
  }

  for (const line of lines) {
    const postHeader = line.match(/^Post\s*(\d+)\s*:?\s*(.*)$/i);

    if (postHeader) {
      pushCurrentPost();
      currentNumber = Number(postHeader[1]);
      captionLines = [];
      hashtags = "";
      mode = "caption";

      const inlineCaption = postHeader[2].trim();
      if (inlineCaption) captionLines.push(inlineCaption);
      continue;
    }

    const hashtagsMatch = line.match(/^Hashtags?\s*:\s*(.+)$/i);
    if (hashtagsMatch && currentNumber !== null) {
      hashtags = hashtagsMatch[1].trim();
      mode = "hashtags";
      continue;
    }

    if (currentNumber !== null && mode === "caption" && line.trim()) {
      captionLines.push(line.trim());
    }
  }

  pushCurrentPost();

  return { posts };
}

export function formatInstagramPostsOutput({
  posts,
}: ParsedInstagramPosts): string {
  if (posts.length === 0) return "";

  return posts
    .map((post) => {
      const wordInfo = post.wordCountNote
        ? ` (${post.wordCountNote})`
        : ` (${post.wordCount} mots)`;

      const sections = [
        `Post ${post.number}${wordInfo}`,
        post.caption,
      ];

      if (post.hashtags) {
        sections.push(
          `Hashtags (${post.hashtagCount})`,
          post.hashtags,
        );
      }

      return sections.join("\n");
    })
    .join("\n\n—\n\n");
}

export function validateInstagramPosts(
  parsed: ParsedInstagramPosts,
): string | null {
  if (parsed.posts.length === 0) {
    return "Aucun post Instagram n'a pu etre extrait de la reponse IA.";
  }

  if (parsed.posts.length > INSTAGRAM_MAX_POSTS) {
    return `Trop de posts generes (maximum ${INSTAGRAM_MAX_POSTS}).`;
  }

  for (const post of parsed.posts) {
    if (!post.hashtags) {
      return `Le post ${post.number} n'a pas de hashtags.`;
    }

    if (post.hashtagCount < INSTAGRAM_MIN_HASHTAGS) {
      return `Le post ${post.number} doit contenir ${INSTAGRAM_MIN_HASHTAGS} a ${INSTAGRAM_MAX_HASHTAGS} hashtags (trouve : ${post.hashtagCount}).`;
    }
  }

  return null;
}
