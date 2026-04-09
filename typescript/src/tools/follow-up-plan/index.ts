import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { z } from "zod";
import { IMcpTool } from "../../mcp/tool.interface";
import { McpResponse } from "../../mcp/response";
import { resolvePatientId } from "../../utils/patient-context";
import {
  getConditions,
  getProcedures,
  getObservations,
  getCarePlans,
} from "../../fhir/queries";
import { planFollowUp } from "./service";

class FollowUpPlanTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.registerTool(
      "PlanFollowUp",
      {
        description:
          "Recommends follow-up visits, labs, and imaging based on conditions and procedures.",
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

        const [conditions, procedures, observations, carePlans] =
          await Promise.all([
            getConditions(req, id),
            getProcedures(req, id),
            getObservations(req, id),
            getCarePlans(req, id),
          ]);

        const result = planFollowUp({
          conditions,
          procedures,
          observations,
          carePlans,
        });

        return McpResponse.json(result);
      },
    );
  }
}

export const followUpPlanTool = new FollowUpPlanTool();
