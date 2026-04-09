/**
 * Follow-up rules for PlanFollowUp tool.
 * Maps SNOMED codes for conditions/procedures to follow-up recommendations.
 */

export interface FollowUpRule {
  snomedCode: string;
  conditionName: string;
  followUps: {
    type: "visit" | "lab" | "imaging";
    specialty: string;
    timeframe: string;
    priority: "routine" | "urgent" | "emergent";
  }[];
}

export const CONDITION_FOLLOW_UP_RULES: FollowUpRule[] = [
  // TODO: Populate with condition-based follow-up rules
];

export const PROCEDURE_FOLLOW_UP_RULES: FollowUpRule[] = [
  // TODO: Populate with procedure-based follow-up rules
];
