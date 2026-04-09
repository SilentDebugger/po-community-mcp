import { fhirR4 } from "@smile-cdr/fhirts";

export type FollowUpPriority = "routine" | "urgent" | "emergent";

export interface FollowUpItem {
  type: string;
  specialty: string;
  timeframe: string;
  reason: string;
  priority: FollowUpPriority;
}

export interface FollowUpPlanResult {
  followUpItems: FollowUpItem[];
}

export interface FollowUpPlanInput {
  conditions: fhirR4.Condition[];
  procedures: fhirR4.Procedure[];
  observations: fhirR4.Observation[];
  carePlans: fhirR4.CarePlan[];
}
