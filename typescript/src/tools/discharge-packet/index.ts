import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { z } from "zod";
import { IMcpTool } from "../../mcp/tool.interface";
import { McpResponse } from "../../mcp/response";
import { resolvePatientId } from "../../utils/patient-context";
import { fetchDischargeFhirData } from "../../fhir/queries";
import { buildDischargePacket } from "./service";

class DischargePacketTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.registerTool(
      "BuildDischargePacket",
      {
        description:
          "Master orchestrator: produces a complete discharge packet as structured JSON with two top-level keys. " +
          "RENDERING RULES — follow exactly, do not summarise or paraphrase the JSON: " +
          "(1) Output TWO clearly separated sections using markdown headers: '## Clinician Packet' and '## Patient Packet'. " +
          "(2) CLINICIAN PACKET — render every field from clinicianPacket verbatim: " +
          "clinical summary: render ONLY the visitSummary narrative string — it already contains diagnoses, procedures, and length of stay; do NOT repeat the diagnoses[], procedures[], or lengthOfStay fields separately as they are redundant with visitSummary, " +
          "medication reconciliation table (new / stopped / changed / continued, plus interaction warnings and allergy conflicts), " +
          "LACE readmission risk score with L/A/C/E breakdown and recommendation, " +
          "complete follow-up plan with specialty, timeframe, and reason for every item, " +
          "and cost savings opportunities with estimated monthly savings. " +
          "(3) PATIENT PACKET — render every field from patientPacket verbatim: " +
          "visit summary, " +
          "full medications list: for each medication render 'Name: route and timing, instructions (BADGE)' — " +
          "add NEW or CHANGED badge where changeType is set; " +
          "warning signs: strings that do NOT start with '- ' are introductory header lines — render them as plain text, NOT as bullets; strings starting with '- ' are the actual warning items — render those as bullets; " +
          "activity restrictions as a bullet list, diet guidance, " +
          "follow-up appointments (timeframe + reason only — no specialty), " +
          "and the askCareTeamReminder as a highlighted callout. " +
          "(4) NEVER show LACE scores, cost savings, medication reconciliation details, or clinical risk data in the Patient Packet section. " +
          "(5) Do not collapse, merge, or omit any fields — if a list is empty, show 'None'. " +
          "(6) Use bullet points for all lists: medication reconciliation (group by status: New / Stopped / Changed / Continued), " +
          "follow-up plan items (each bullet: timeframe — specialty — reason), " +
          "warning signs, activity restrictions, and cost savings opportunities. ",
        inputSchema: {
          patientId: z
            .string()
            .describe(
              "The patient ID. Optional if patient context exists.",
            )
            .optional(),
          readingLevel: z
            .enum(["simple", "standard", "detailed"])
            .describe("Reading level for discharge instructions.")
            .default("standard"),
        },
      },
      async ({ patientId, readingLevel }) => {
        const id = resolvePatientId(patientId, req);
        let data;
        try {
          data = await fetchDischargeFhirData(req, id);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return McpResponse.error(message);
        }
        const result = await buildDischargePacket(data, readingLevel);
        return McpResponse.json(result);
      },
    );
  }
}

export const dischargePacketTool = new DischargePacketTool();
