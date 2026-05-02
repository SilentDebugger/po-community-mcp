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
          "Master orchestrator: produces a complete discharge packet split into two separate documents. " +
          "The response contains two top-level keys: " +
          "'clinicianPacket' (full clinical detail: medication reconciliation, readmission risk LACE score, " +
          "complete follow-up plan, cost savings, and a structured clinical summary with diagnoses, procedures, and length of stay) and " +
          "'patientPacket' (patient-friendly: visit summary in plain 'you/your' language with all medical abbreviations expanded, " +
          "medications, warning signs, activity restrictions, diet guidance, simplified follow-up appointments, " +
          "and a 'Before you leave' care-team reminder). " +
          "Always render clinicianPacket and patientPacket as two clearly labelled separate sections. " +
          "Never show cost savings or LACE scores to the patient.",
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
        const data = await fetchDischargeFhirData(req, id);
        const result = await buildDischargePacket(data, readingLevel);
        return McpResponse.json(result);
      },
    );
  }
}

export const dischargePacketTool = new DischargePacketTool();
