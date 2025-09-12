/**
 * A generic DTO (Data Transfer Object) class for standardizing API responses.
 * This provides a consistent structure for all data sent from the server.
 */
export class ApiResponse<T> {
  public success: boolean;
  public statusCode: number;
  public data: T | null;
  public error: string | null;
  public timestamp: string;

  private constructor(
    success: boolean,
    statusCode: number,
    data: T | null,
    error: string | null
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Creates a standardized success response.
   * @param data The payload to be sent.
   */
  public static success<T>(data: T, statusCode: number = 200): ApiResponse<T> {
    return new ApiResponse(true, statusCode, data, null);
  }

  /**
   * Creates a standardized error response.
   * @param errorMessage The error message.
   */
  public static error<T>(
    errorMessage: string,
    statusCode: number = 500
  ): ApiResponse<T> {
    return new ApiResponse<T>(false, statusCode, null, errorMessage);
  }
}
