import { DomainResource } from "@smile-cdr/fhirts/dist/FHIR-R4/classes/domainResource";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { Request } from "express";
import { fhirR4 } from "@smile-cdr/fhirts";
import { FhirContext, getFhirContext } from "./context";
import { logger } from "../logger";

export class FhirClient {
  async read<T extends DomainResource>(
    req: Request,
    path: string,
  ): Promise<T | null> {
    const ctx = this.requireContext(req);
    return this.execute<T>(
      { method: "get", url: this.buildUrl(ctx, path) },
      ctx,
    );
  }

  async search(
    req: Request,
    resourceType: string,
    params: string[],
  ): Promise<fhirR4.Bundle | null> {
    const ctx = this.requireContext(req);
    const query = params.map((p) => encodeURI(p)).join("&");
    return this.execute<fhirR4.Bundle>(
      { method: "get", url: this.buildUrl(ctx, `${resourceType}?${query}`) },
      ctx,
    );
  }

  private async execute<T>(
    config: AxiosRequestConfig,
    ctx: FhirContext,
  ): Promise<T | null> {
    if (ctx.token) {
      config.headers = { Authorization: `Bearer ${ctx.token}` };
    }

    try {
      logger.debug("FHIR request", {
        method: config.method,
        url: config.url,
      });
      const response = await axios(config);
      return response.data as T;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private requireContext(req: Request): FhirContext {
    const ctx = getFhirContext(req);
    if (!ctx) {
      throw new Error(
        "FHIR context is required but was not found in request headers",
      );
    }
    return ctx;
  }

  private buildUrl(ctx: FhirContext, path: string): string {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${ctx.url}/${normalizedPath}`;
  }
}

export const fhirClient = new FhirClient();
