import { ApiError } from "./api-error";

/**
 * A simple API client for making HTTP requests.
 * Supports GET, POST, PUT, DELETE methods.
 * Automatically includes an API key in the headers if provided.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = import.meta.env.DEV ? "" : baseUrl;
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody;
      try {
        // Try to parse the error response as JSON
        errorBody = await response.clone().json();
      } catch (e) {
        // The response was not valid JSON. Log the parsing error and use the raw
        // text as the error message.
        console.error("Failed to parse API error response as JSON:", e);

        // If JSON parsing fails, use the raw text as the message
        const text = await response.text();
        errorBody = {
          message: text || `API request failed with status ${response.status}`,
        };
      }
      throw new ApiError(response.status, errorBody, errorBody.message);
    }

    // Handle cases where the response is successful but has no body (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    }
    return Promise.resolve();
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }
}
