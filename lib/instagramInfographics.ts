import {
  INFOGRAPHIC_MAX_BULLETS,
  INFOGRAPHIC_MAX_SLIDES,
  INFOGRAPHIC_MAX_TITLE_WORDS,
  INFOGRAPHIC_MIN_BULLETS,
  INFOGRAPHIC_MIN_SLIDES,
} from "@/lib/prompts/instagramInfographics";

export type InfographicSlide = {
  number: number;
  title: string;
  titleWordCount: number;
  titleWordNote: string | null;
  bullets: string[];
  illustration: string;
  isFinal: boolean;
};

export type ParsedInstagramInfographics = {
  slides: InfographicSlide[];
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getTitleWordNote(wordCount: number): string | null {
  if (wordCount > INFOGRAPHIC_MAX_TITLE_WORDS) {
    return `${wordCount} mots (max ${INFOGRAPHIC_MAX_TITLE_WORDS})`;
  }
  return null;
}

function normalizeBullet(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^[-•*]\s*(.+)$/);
  return match ? match[1].trim() : null;
}

export function parseInstagramInfographicsResponse(
  raw: string,
): ParsedInstagramInfographics {
  const lines = raw.split("\n");
  const slides: InfographicSlide[] = [];

  let currentNumber: number | null = null;
  let title = "";
  let bullets: string[] = [];
  let illustration = "";
  let section: "title" | "bullets" | "illustration" | "idle" = "idle";

  function pushCurrentSlide() {
    if (currentNumber === null || !title) return;

    const titleWordCount = countWords(title);
    slides.push({
      number: currentNumber,
      title,
      titleWordCount,
      titleWordNote: getTitleWordNote(titleWordCount),
      bullets,
      illustration,
      isFinal: false,
    });
  }

  for (const line of lines) {
    const slideHeader = line.match(/^Slide\s*(\d+)\s*:?\s*$/i);

    if (slideHeader) {
      pushCurrentSlide();
      currentNumber = Number(slideHeader[1]);
      title = "";
      bullets = [];
      illustration = "";
      section = "idle";
      continue;
    }

    const titleMatch = line.match(/^Titre\s*:\s*(.+)$/i);
    if (titleMatch && currentNumber !== null) {
      title = titleMatch[1].trim();
      section = "title";
      continue;
    }

    if (/^Points?\s*:?\s*$/i.test(line.trim()) && currentNumber !== null) {
      section = "bullets";
      continue;
    }

    const illustrationMatch = line.match(
      /^(Illustration|Visuel|Image)\s*:\s*(.+)$/i,
    );
    if (illustrationMatch && currentNumber !== null) {
      illustration = illustrationMatch[2].trim();
      section = "illustration";
      continue;
    }

    const bullet = normalizeBullet(line);
    if (bullet && currentNumber !== null && section === "bullets") {
      bullets.push(bullet);
      continue;
    }
  }

  pushCurrentSlide();

  if (slides.length > 0) {
    slides[slides.length - 1].isFinal = true;
  }

  return { slides };
}

export function formatInstagramInfographicsOutput({
  slides,
}: ParsedInstagramInfographics): string {
  if (slides.length === 0) return "";

  return slides
    .map((slide) => {
      const titleInfo = slide.titleWordNote
        ? ` (${slide.titleWordNote})`
        : ` (${slide.titleWordCount} mots)`;

      const finalNote = slide.isFinal ? " — Conclusion / CTA" : "";
      const bulletLines = slide.bullets.map((item) => `  • ${item}`).join("\n");

      return [
        `Slide ${slide.number}${finalNote}`,
        `Titre${titleInfo} : ${slide.title}`,
        "Points :",
        bulletLines,
        `Illustration : ${slide.illustration || "—"}`,
      ].join("\n");
    })
    .join("\n\n—\n\n");
}

export function validateInstagramInfographics(
  parsed: ParsedInstagramInfographics,
): string | null {
  if (parsed.slides.length === 0) {
    return "Aucun slide n'a pu etre extrait de la reponse IA.";
  }

  if (parsed.slides.length < INFOGRAPHIC_MIN_SLIDES) {
    return `Pas assez de slides (minimum ${INFOGRAPHIC_MIN_SLIDES}, trouve : ${parsed.slides.length}).`;
  }

  if (parsed.slides.length > INFOGRAPHIC_MAX_SLIDES) {
    return `Trop de slides (maximum ${INFOGRAPHIC_MAX_SLIDES}, trouve : ${parsed.slides.length}).`;
  }

  for (const slide of parsed.slides) {
    if (!slide.title) {
      return `Le slide ${slide.number} n'a pas de titre.`;
    }

    if (slide.bullets.length < INFOGRAPHIC_MIN_BULLETS) {
      return `Le slide ${slide.number} doit contenir ${INFOGRAPHIC_MIN_BULLETS} a ${INFOGRAPHIC_MAX_BULLETS} points (trouve : ${slide.bullets.length}).`;
    }

    if (!slide.illustration) {
      return `Le slide ${slide.number} n'a pas d'idee d'illustration.`;
    }
  }

  return null;
}
