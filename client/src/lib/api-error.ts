/**
 * Represents an error from an API call.
 */
export class ApiError extends Error {
  /** The HTTP status code of the response. */
  public readonly status: number;
  /** The response body, parsed as JSON if possible. */
  public readonly body: any;

  /**
   * @param status - The HTTP status code.
   * @param body - The response body.
   * @param message - An optional error message.
   */
  constructor(status: number, body: any, message?: string) {
    super(message || `API Error: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
