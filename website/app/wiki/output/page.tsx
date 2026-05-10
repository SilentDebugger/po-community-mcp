export const metadata = { title: "Output format" };

export default function OutputFormatPage() {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Overview
      </div>
      <h1>Output format</h1>
      <p>
        All MCP tools in this server return one of two shapes via the shared{" "}
        <code>McpResponse</code> helper: a <strong>text</strong> response for
        small scalar results, or a <strong>JSON</strong> response for
        structured results. Errors always use the same error shape regardless
        of the tool.
      </p>

      <h2>Response helpers</h2>
      <pre>{`McpResponse.text(value)   → { content: [{ type: "text", text: value }] }
McpResponse.json(value)   → { content: [{ type: "text", text: JSON.stringify(value) }] }
McpResponse.error(msg)    → { content: [{ type: "text", text: msg }], isError: true }`}</pre>
      <p>
        JSON responses are serialised as a single stringified payload inside a
        <code> text </code>content block — that is the standard MCP convention
        and it keeps responses compatible with any MCP client.
      </p>

      <h2>The discharge packet (the canonical output)</h2>
      <p>
        <code>BuildDischargePacket</code> is the primary output consumers
        target. The full shape is:
      </p>
      <pre>{`{
  patient:   fhir.Patient,
  encounter: fhir.Encounter,
  medicationReconciliation: ReconcileMedicationsResult | { error: string },
  dischargeInstructions:    DischargeInstructionsResult  | { error: string },
  readmissionRisk:          ReadmissionRiskResult        | { error: string },
  followUpPlan:             FollowUpPlanResult           | { error: string },
  costSavings:              AuditMedCostsResult          | { error: string },
  generatedAt: string,   // ISO 8601 timestamp
  disclaimer:  string    // Standard safety disclaimer
}`}</pre>

      <h2>Sub-tool shapes</h2>

      <h3>ReconcileMedicationsResult</h3>
      <pre>{`{
  reconciliation: {
    new:       MedicationChange[],
    stopped:   MedicationChange[],
    changed:   MedicationChange[],
    continued: MedicationChange[]
  },
  interactionWarnings: string[],
  allergyConflicts:    string[]
}

MedicationChange = {
  medication:      string,
  rxNormCode?:     string,
  previousDosage?: string,
  currentDosage?:  string
}`}</pre>

      <h3>DischargeInstructionsResult</h3>
      <pre>{`{
  visitSummary: string,
  medications: Array<{
    name: string,
    dosage: string,
    frequency: string,
    instructions: string,
    warnings?: string[]
  }>,
  warningSigns:        string[],
  activityRestrictions: string[],
  dietGuidance:        string
}`}</pre>

      <h3>ReadmissionRiskResult</h3>
      <pre>{`{
  laceScore:  number,
  category:   "low" | "moderate" | "high",
  breakdown:  { L: number, A: number, C: number, E: number },
  recommendation: string
}`}</pre>

      <h3>FollowUpPlanResult</h3>
      <pre>{`{
  followUpItems: Array<{
    type:        string,
    specialty?:  string,
    timeframe:   string,
    reason:      string,
    priority:    "routine" | "high" | "urgent" | "emergent",
    study?:      string,
    tests?:      string[]
  }>,
  readmissionRiskNote: string
}`}</pre>

      <h3>AuditMedCostsResult</h3>
      <pre>{`{
  savingsOpportunities: Array<{
    currentMedication:        string,
    suggestedAlternative:     string,
    estimatedMonthlySavings:  number,
    reason:                   string
  }>,
  totalEstimatedMonthlySavings: number,
  noChangeNeeded: string[],
  unanalyzed:     string[],
  disclaimer:     string
}`}</pre>

      <h2>Guarantees</h2>
      <ul>
        <li>
          <strong>Every tool response is valid JSON</strong> or a simple text
          string. There are no streaming partial payloads today.
        </li>
        <li>
          <strong>Sub-tool isolation.</strong> Inside{" "}
          <code>BuildDischargePacket</code>, one failing sub-tool never aborts
          the response — its slot becomes <code>{`{ error: "…" }`}</code>.
        </li>
        <li>
          <strong>Stable field names.</strong> Response shapes live in typed
          <code> types.ts </code>files per tool; breaking changes require a
          semver bump on the server.
        </li>
      </ul>
    </>
  );
}
