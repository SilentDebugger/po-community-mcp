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
          "Master orchestrator: produces a complete discharge packet including medication reconciliation, " +
          "discharge instructions, readmission risk, follow-up plan, and cost savings in a single call.",
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
