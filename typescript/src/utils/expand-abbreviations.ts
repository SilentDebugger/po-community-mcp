import { MEDICAL_ABBREVIATIONS } from "../data/medical-abbreviations";

// (?<!\() prevents re-expanding abbreviations that already appear inside
// parentheses — e.g. "Deep venous thrombosis (DVT)" stays untouched while a
// standalone "DVT" in free text is still expanded.
const ABBREVIATION_REGEX = new RegExp(
  `(?<!\\()\\b(${Object.keys(MEDICAL_ABBREVIATIONS)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\b`,
  "g",
);

/**
 * Expands a single token if it matches a known medical abbreviation.
 * Returns the original token unchanged if no match is found.
 */
export function expandAbbreviationToken(token: string): string {
  return MEDICAL_ABBREVIATIONS[token] ?? token;
}

/**
 * Replaces all known medical abbreviations within a free-text string with
 * their patient-facing expansions. The regex is compiled once at module load.
 */
export function expandAbbreviations(text: string): string {
  ABBREVIATION_REGEX.lastIndex = 0;
  return text.replace(
    ABBREVIATION_REGEX,
    (match) => MEDICAL_ABBREVIATIONS[match] ?? match,
  );
}
