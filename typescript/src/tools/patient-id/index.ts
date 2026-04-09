import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { z } from "zod";
import { fhirR4 } from "@smile-cdr/fhirts";
import { IMcpTool } from "../../mcp/tool.interface";
import { McpResponse } from "../../mcp/response";
import { getOrThrow } from "../../utils/null";
import { fhirClient } from "../../fhir/client";

class PatientIdTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.registerTool(
      "FindPatientId",
      {
        description: "Finds a patient id given a first name and last name",
        inputSchema: {
          firstName: z.string().describe("The patient's first name").nonempty(),
          lastName: z
            .string()
            .describe("The patient's last name. This is optional")
            .optional(),
        },
      },
      async ({ firstName, lastName }) => {
        let patients = await this.searchPatients(req, firstName, lastName);
        if (!patients.length) {
          patients = await this.searchPatients(req, lastName, firstName);
        }

        if (patients.length > 1) {
          return McpResponse.error(
            "More than one patient was found. Provide more details.",
          );
        }

        return patients[0]
          ? McpResponse.text(getOrThrow(patients[0].id))
          : McpResponse.error("No patient could be found with that name");
      },
    );
  }

  private async searchPatients(
    req: Request,
    given: string | null | undefined,
    family: string | null | undefined,
  ): Promise<fhirR4.Patient[]> {
    const params: string[] = [];
    if (given) params.push(`given=${given}`);
    if (family) params.push(`family=${family}`);

    const bundle = await fhirClient.search(req, "Patient", params);
    if (!bundle?.entry?.length) return [];

    return bundle.entry
      .filter((e) => e.resource != null)
      .map((e) => e.resource as unknown as fhirR4.Patient);
  }
}

export const patientIdTool = new PatientIdTool();
