import { X_MAX_POST_LENGTH } from "@/lib/prompts/xPosts";

export type XPost = {
  number: number;
  text: string;
  charCount: number;
  trimmed: boolean;
};

export type ParsedXPosts = {
  posts: XPost[];
  hashtags: string;
};

function enforcePostLimit(text: string): { text: string; trimmed: boolean } {
  if (text.length <= X_MAX_POST_LENGTH) {
    return { text, trimmed: false };
  }
  return {
    text: `${text.slice(0, X_MAX_POST_LENGTH - 1)}…`,
    trimmed: true,
  };
}

export function parseXPostsResponse(raw: string): ParsedXPosts {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const posts: XPost[] = [];
  let hashtags = "";

  const postPattern = /^Post\s*(\d+)\s*:\s*(.+)$/i;
  const hashtagsPattern = /^Hashtags?\s*:\s*(.+)$/i;

  for (const line of lines) {
    const postMatch = line.match(postPattern);
    if (postMatch) {
      const number = Number(postMatch[1]);
      const { text, trimmed } = enforcePostLimit(postMatch[2].trim());
      posts.push({
        number,
        text,
        charCount: text.length,
        trimmed,
      });
      continue;
    }

    const hashtagsMatch = line.match(hashtagsPattern);
    if (hashtagsMatch) {
      hashtags = hashtagsMatch[1].trim();
    }
  }

  if (posts.length === 0) {
    const numberedPattern = /^(\d+)\.\s*(.+)$/;
    for (const line of lines) {
      const match = line.match(numberedPattern);
      if (match) {
        const { text, trimmed } = enforcePostLimit(match[2].trim());
        posts.push({
          number: Number(match[1]),
          text,
          charCount: text.length,
          trimmed,
        });
      }
    }
  }

  if (!hashtags) {
    const tagLine = lines.find((line) => line.includes("#"));
    if (tagLine) hashtags = tagLine.replace(/^Hashtags?\s*:\s*/i, "").trim();
  }

  return { posts, hashtags };
}

export function formatXPostsOutput({ posts, hashtags }: ParsedXPosts): string {
  if (posts.length === 0) {
    return "";
  }

  const sections = posts.map((post) => {
    const limitNote = post.trimmed ? " [tronque]" : "";
    return [
      `Post ${post.number} (${post.charCount}/${X_MAX_POST_LENGTH})${limitNote}`,
      post.text,
    ].join("\n");
  });

  if (hashtags) {
    sections.push(`Hashtags\n${hashtags}`);
  }

  return sections.join("\n\n");
}

export function validateXPosts(parsed: ParsedXPosts): string | null {
  if (parsed.posts.length === 0) {
    return "Aucun post X n'a pu etre extrait de la reponse IA.";
  }

  if (parsed.posts.length > 3) {
    return "Trop de posts generes (maximum 3).";
  }

  for (const post of parsed.posts) {
    if (post.charCount > X_MAX_POST_LENGTH) {
      return `Le post ${post.number} depasse ${X_MAX_POST_LENGTH} caracteres.`;
    }
  }

  return null;
}
