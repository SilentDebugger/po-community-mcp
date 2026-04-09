import { Request } from "express";
import * as jose from "jose";
import { FHIR_HEADERS } from "../fhir/constants";

/**
 * Resolves a patient ID from either an explicit parameter, a JWT claim,
 * or the x-patient-id header. Throws if none are available.
 */
export function resolvePatientId(
  explicitId: string | undefined,
  req: Request,
): string {
  if (explicitId) return explicitId;

  const fromContext = getPatientIdFromContext(req);
  if (fromContext) return fromContext;

  throw new Error(
    "Patient ID is required: provide it as a parameter or ensure FHIR context includes patient identity",
  );
}

function getPatientIdFromContext(req: Request): string | null {
  const token = req.headers[FHIR_HEADERS.ACCESS_TOKEN]?.toString();
  if (token) {
    const claims = jose.decodeJwt(token);
    const patientClaim = claims["patient"]?.toString();
    if (patientClaim) return patientClaim;
  }

  return req.headers[FHIR_HEADERS.PATIENT_ID]?.toString() ?? null;
}
