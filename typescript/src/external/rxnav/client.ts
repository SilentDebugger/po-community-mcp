import axios from "axios";
import { logger } from "../../logger";
import { RxNavRelatedResponse, RxNavRelatedGroup } from "./types";

const RXNAV_BASE_URL = "https://rxnav.nlm.nih.gov/REST";
const RXNAV_TIMEOUT_MS = 5000;

/**
 * Fetches related brand (SBD) and generic (SCD) drugs for a given RXCUI.
 * Returns null when the API is unreachable/errors, empty array when no related drugs exist.
 */
export async function getRelatedGenerics(
  rxcui: string,
): Promise<RxNavRelatedGroup[] | null> {
  try {
    const response = await axios.get<RxNavRelatedResponse>(
      `${RXNAV_BASE_URL}/rxcui/${rxcui}/related.json?tty=SBD+SCD`,
      { timeout: RXNAV_TIMEOUT_MS },
    );

    return (
      response.data.relatedGroup?.conceptGroup?.flatMap(
        (g) =>
          g.conceptProperties?.map((p) => ({
            rxcui: p.rxcui,
            tty: p.tty,
            name: p.name,
          })) ?? [],
      ) ?? []
    );
  } catch (error) {
    logger.warn("RxNav API unavailable", {
      rxcui,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
