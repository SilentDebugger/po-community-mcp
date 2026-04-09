import { CallToolResult } from "@modelcontextprotocol/sdk/types";

export const McpResponse = {
  text(text: string): CallToolResult {
    return { content: [{ type: "text", text }], isError: false };
  },

  error(text: string): CallToolResult {
    return { content: [{ type: "text", text }], isError: true };
  },

  json(data: unknown): CallToolResult {
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      isError: false,
    };
  },
};
