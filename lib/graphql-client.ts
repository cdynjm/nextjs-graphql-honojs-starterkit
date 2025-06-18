// lib/graphql-client.ts
import { GraphQLClient } from "graphql-request";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function getGraphQLClient(endpoint: string, token?: string) {
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const sanitizedEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${baseUrl}${sanitizedEndpoint}`;

  return new GraphQLClient(url, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });
}
