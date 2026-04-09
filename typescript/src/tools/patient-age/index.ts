import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { z } from "zod";
import { differenceInYears, parseISO } from "date-fns";
import { IMcpTool } from "../../mcp/tool.interface";
import { McpResponse } from "../../mcp/response";
import { resolvePatientId } from "../../utils/patient-context";
import { getPatient } from "../../fhir/queries";

class PatientAgeTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.registerTool(
      "GetPatientAge",
      {
        description: "Gets the age of a patient.",
        inputSchema: {
          patientId: z
            .string()
            .describe(
              "The id of the patient. Optional if patient context exists.",
            )
            .optional(),
        },
      },
      async ({ patientId }) => {
        const id = resolvePatientId(patientId, req);
        const patient = await getPatient(req, id);

        if (!patient) {
          return McpResponse.error("The patient could not be found.");
        }

        if (!patient.birthDate) {
          return McpResponse.error(
            "A birth date could not be found for the patient.",
          );
        }

        try {
          const date = parseISO(patient.birthDate);
          const age = differenceInYears(new Date(), date);
          return McpResponse.text(`The patient's age is: ${age}`);
        } catch {
          return McpResponse.error(
            "Could not parse the patient's birth date.",
          );
        }
      },
    );
  }
}

export const patientAgeTool = new PatientAgeTool();
