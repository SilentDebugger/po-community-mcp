import { Request } from "express";
import { fhirR4 } from "@smile-cdr/fhirts";
import { fhirClient } from "./client";

export interface DischargeFhirData {
  patient: fhirR4.Patient;
  encounter: fhirR4.Encounter;
  allEncounters: fhirR4.Encounter[];
  conditions: fhirR4.Condition[];
  procedures: fhirR4.Procedure[];
  medicationRequests: fhirR4.MedicationRequest[];
  allergyIntolerances: fhirR4.AllergyIntolerance[];
  observations: fhirR4.Observation[];
  carePlans: fhirR4.CarePlan[];
}

export async function getPatient(
  req: Request,
  patientId: string,
): Promise<fhirR4.Patient | null> {
  return fhirClient.read<fhirR4.Patient>(req, `Patient/${patientId}`);
}

export async function getEncounters(
  req: Request,
  patientId: string,
  params: string[] = [],
): Promise<fhirR4.Encounter[]> {
  const bundle = await fhirClient.search(req, "Encounter", [
    `patient=${patientId}`,
    ...params,
  ]);
  return extractResources<fhirR4.Encounter>(bundle);
}

export async function getMedicationRequests(
  req: Request,
  patientId: string,
  params: string[] = [],
): Promise<fhirR4.MedicationRequest[]> {
  const bundle = await fhirClient.search(req, "MedicationRequest", [
    `patient=${patientId}`,
    ...params,
  ]);
  return extractResources<fhirR4.MedicationRequest>(bundle);
}

export async function getAllergyIntolerances(
  req: Request,
  patientId: string,
): Promise<fhirR4.AllergyIntolerance[]> {
  const bundle = await fhirClient.search(req, "AllergyIntolerance", [
    `patient=${patientId}`,
  ]);
  return extractResources<fhirR4.AllergyIntolerance>(bundle);
}

export async function getConditions(
  req: Request,
  patientId: string,
  params: string[] = [],
): Promise<fhirR4.Condition[]> {
  const bundle = await fhirClient.search(req, "Condition", [
    `patient=${patientId}`,
    ...params,
  ]);
  return extractResources<fhirR4.Condition>(bundle);
}

export async function getProcedures(
  req: Request,
  patientId: string,
  params: string[] = [],
): Promise<fhirR4.Procedure[]> {
  const bundle = await fhirClient.search(req, "Procedure", [
    `patient=${patientId}`,
    ...params,
  ]);
  return extractResources<fhirR4.Procedure>(bundle);
}

export async function getObservations(
  req: Request,
  patientId: string,
  params: string[] = [],
): Promise<fhirR4.Observation[]> {
  const bundle = await fhirClient.search(req, "Observation", [
    `patient=${patientId}`,
    ...params,
  ]);
  return extractResources<fhirR4.Observation>(bundle);
}

export async function getCarePlans(
  req: Request,
  patientId: string,
): Promise<fhirR4.CarePlan[]> {
  const bundle = await fhirClient.search(req, "CarePlan", [
    `patient=${patientId}`,
  ]);
  return extractResources<fhirR4.CarePlan>(bundle);
}

/**
 * Fetches all FHIR data needed for the discharge packet in parallel.
 * Used by BuildDischargePacket to avoid redundant fetches across sub-tools.
 */
export async function fetchDischargeFhirData(
  req: Request,
  patientId: string,
): Promise<DischargeFhirData> {
  const [
    patient,
    inpatientEncounters,
    allEncounters,
    conditions,
    procedures,
    medicationRequests,
    allergyIntolerances,
    observations,
    carePlans,
  ] = await Promise.all([
    getPatient(req, patientId),
    getEncounters(req, patientId, ["class=IMP", "_sort=-date", "_count=1"]),
    getEncounters(req, patientId),
    getConditions(req, patientId),
    getProcedures(req, patientId),
    getMedicationRequests(req, patientId),
    getAllergyIntolerances(req, patientId),
    getObservations(req, patientId),
    getCarePlans(req, patientId),
  ]);

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  const encounter = inpatientEncounters[0];
  if (!encounter) {
    throw new Error(`No inpatient encounter found for patient ${patientId}`);
  }

  return {
    patient,
    encounter,
    allEncounters,
    conditions,
    procedures,
    medicationRequests,
    allergyIntolerances,
    observations,
    carePlans,
  };
}

function extractResources<T>(bundle: fhirR4.Bundle | null): T[] {
  if (!bundle?.entry?.length) return [];
  return bundle.entry
    .filter((e) => e.resource != null)
    .map((e) => e.resource as unknown as T);
}
