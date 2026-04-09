import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { z } from "zod";
import { IMcpTool } from "../../mcp/tool.interface";
import { McpResponse } from "../../mcp/response";
import { resolvePatientId } from "../../utils/patient-context";
import {
  getEncounters,
  getMedicationRequests,
  getAllergyIntolerances,
} from "../../fhir/queries";
import { reconcileMedications } from "./service";

class ReconcileMedicationsTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.registerTool(
      "ReconcileMedications",
      {
        description:
          "Compares pre-admission vs discharge medications. Flags new, stopped, changed, and continued. Checks interactions and allergy conflicts.",
        inputSchema: {
          patientId: z
            .string()
            .describe(
              "The patient ID. Optional if patient context exists.",
            )
            .optional(),
        },
      },
      async ({ patientId }) => {
        const id = resolvePatientId(patientId, req);

        const [encounters, medicationRequests, allergyIntolerances] =
          await Promise.all([
            getEncounters(req, id, [
              "class=IMP",
              "_sort=-date",
              "_count=1",
            ]),
            getMedicationRequests(req, id),
            getAllergyIntolerances(req, id),
          ]);

        const encounter = encounters[0];
        if (!encounter) {
          return McpResponse.error("No inpatient encounter found.");
        }

        const result = reconcileMedications({
          encounter,
          medicationRequests,
          allergyIntolerances,
        });

        return McpResponse.json(result);
      },
    );
  }
}

export const reconcileMedicationsTool = new ReconcileMedicationsTool();
