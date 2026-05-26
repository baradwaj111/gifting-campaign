import type { InterestCategory } from "@/generated/prisma/enums";

export type InterestInput = {
  contactId: string;
  category: InterestCategory;
  label: string;
  evidence: string;
  sourceUrl?: string;
  confidence: number;
  detectedBy: string;
};

// ── Keyword rules per category ─────────────────────────────────────────────
const RULES: Record<InterestCategory, string[]> = {
  FITNESS: [
    "running", "marathon", "ultramarathon", "crossfit", "gym", "cycling",
    "hiking", "yoga", "triathlon", "workout", "fitness", "peloton",
    "weightlifting", "pilates", "trail run", "half marathon", "spin class",
    "14ers", "mountain bike",
  ],
  MUSIC: [
    "concert", "concerts", "guitar", "piano", "jazz", "vinyl", "playlist",
    "musician", "band", "music", "album", "singer", "drums", "indie",
    "electronic", "ambient", "live music", "record",
  ],
  SPORTS: [
    "football", "basketball", "baseball", "tennis", "golf", "soccer",
    "nba", "nfl", "mlb", "premier league", "formula 1", "f1", "olympics",
    "cubs", "bears", "warriors", "cowboys", "arsenal", "broncos",
    "season ticket",
  ],
  TRAVEL: [
    "travel", "adventure", "backpacking", "exploring", "wanderlust",
    "passport", "vacation", "trip", "destination", "abroad", "international",
    "country", "countries", "roadshow", "patagonia", "tokyo", "kyoto",
    "vietnam", "morocco", "singapore",
  ],
  FAMILY: [
    "family", "kids", "children", "parenting", "dad", "mom", "father",
    "mother", "daughter", "son", "baby", "toddler", "boys",
  ],
  FOOD: [
    "cooking", "chef", "foodie", "wine", "coffee", "culinary", "restaurant",
    "baking", "kitchen", "recipe", "michelin", "cuisine", "brisket",
    "deep-dish", "roast", "dining", "food scene", "wset",
  ],
  BOOKS: [
    "reading", "books", "author", "bookclub", "book club", "literature",
    "novel", "nonfiction", "kindle", "library", "reading list", "biography",
    "four books", "two books", "three books",
  ],
  TECH: [
    "ai", "machine learning", "coding", "startup", "saas", "developer",
    "programming", "open source", "cloud", "kubernetes", "blockchain",
    "web3", "python", "grafana", "cncf", "raspberry pi", "cloud-native",
  ],
  GAMING: [
    "gaming", "esports", "playstation", "xbox", "twitch", "streamer",
    "steam", "nintendo", "warzone", "minecraft", "league of legends",
    "elden ring", "strategy games", "indie games", "pc gaming",
  ],
  ART: [
    "painting", "gallery", "museum", "design", "creative", "art",
    "photography", "illustration", "sculpture", "exhibition", "watercolor",
    "screen printing", "sketch", "lacma", "ago", "moma", "galleries",
  ],
  UNKNOWN: [],
};

// ── Helpers ────────────────────────────────────────────────────────────────

function findEvidenceSnippet(text: string, keyword: string): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(keyword.toLowerCase());
  if (idx === -1) return keyword;
  // Return ~120 chars centered on the match
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + keyword.length + 80);
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < text.length) snippet = snippet + "…";
  return snippet;
}

function matchCount(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
}

function confidenceFromMatches(count: number): number {
  if (count >= 4) return 0.95;
  if (count === 3) return 0.88;
  if (count === 2) return 0.78;
  return 0.65;
}

function humanLabel(category: InterestCategory): string {
  const labels: Record<InterestCategory, string> = {
    FITNESS: "Fitness & Wellness",
    MUSIC: "Music",
    SPORTS: "Sports Fan",
    TRAVEL: "Travel",
    FAMILY: "Family-Oriented",
    FOOD: "Food & Culinary",
    BOOKS: "Reading & Books",
    TECH: "Technology",
    GAMING: "Gaming",
    ART: "Art & Culture",
    UNKNOWN: "Unknown",
  };
  return labels[category];
}

// ── Main export ────────────────────────────────────────────────────────────

export function extractInterests(
  contactId: string,
  profiles: Array<{ rawText: string | null; url: string }>
): InterestInput[] {
  // Merge all rawText from all profiles
  const mergedText = profiles
    .map((p) => p.rawText ?? "")
    .join(" ");

  if (!mergedText.trim()) return [];

  const results: InterestInput[] = [];
  const categoriesToCheck = Object.keys(RULES).filter(
    (c) => c !== "UNKNOWN"
  ) as InterestCategory[];

  for (const category of categoriesToCheck) {
    const keywords = RULES[category];
    const count = matchCount(mergedText, keywords);
    if (count === 0) continue;

    // Find the best evidence snippet from the first matching keyword
    const firstMatch = keywords.find((kw) =>
      mergedText.toLowerCase().includes(kw.toLowerCase())
    )!;
    const evidence = findEvidenceSnippet(mergedText, firstMatch);

    // Find which profile contained the match (for sourceUrl)
    const sourceProfile = profiles.find(
      (p) => p.rawText?.toLowerCase().includes(firstMatch.toLowerCase())
    );

    results.push({
      contactId,
      category,
      label: humanLabel(category),
      evidence,
      sourceUrl: sourceProfile?.url,
      confidence: confidenceFromMatches(count),
      detectedBy: "rule-engine-v1",
    });
  }

  return results;
}
