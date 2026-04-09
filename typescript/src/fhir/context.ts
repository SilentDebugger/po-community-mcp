import { Request } from "express";
import { FHIR_HEADERS } from "./constants";

export interface FhirContext {
  url: string;
  token?: string;
}

export function getFhirContext(req: Request): FhirContext | null {
  const url = req.headers[FHIR_HEADERS.SERVER_URL]?.toString();
  if (!url) return null;

  const token = req.headers[FHIR_HEADERS.ACCESS_TOKEN]?.toString();
  return { url, token };
}
