/**
 * A generic DTO (Data Transfer Object) class for standardizing API responses.
 * This provides a consistent structure for all data sent from the server.
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T | null;
  error: string | null;
  timestamp: string;
}
