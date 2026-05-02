import { fhirR4 } from "@smile-cdr/fhirts";
import type { FollowUpItem } from "../../data/follow-up-rules";

export type { FollowUpPriority, FollowUpItem } from "../../data/follow-up-rules";

export interface FollowUpPlanResult {
  followUpItems: FollowUpItem[];
  readmissionRiskNote: string;
}

export interface FollowUpPlanInput {
  conditions: fhirR4.Condition[];
  procedures: fhirR4.Procedure[];
  observations: fhirR4.Observation[];
  carePlans: fhirR4.CarePlan[];
}

