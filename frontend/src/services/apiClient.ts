/**
 * Base API Client configuration for AI Multimodal Presentation Coach
 * Configured to connect with Backend API (FastAPI / Express / Spring Boot)
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error(`API GET request failed with status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = {
      ...this.getAuthHeader(),
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API POST request failed with status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
