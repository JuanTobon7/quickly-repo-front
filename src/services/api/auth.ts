import api from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  type: string;
  employee: {
    id: string;
    name: string;
    lastname: string;
    email: string;
    createdAt: string;
    costCenterIds: string[];
  };
};

const baseUrl = "/auth";

/**
 * Login user
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post(`${baseUrl}/login`, payload);
  // El endpoint de login devuelve directamente { token, type, employee }
  // sin la estructura ApiResponse, por lo que accedemos directamente a response.data
  return response.data || response;
}

/**
 * Logout user (client-side only - clear token)
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

/**
 * Get stored token
 */
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Get stored user
 */
export function getUser(): AuthResponse['employee'] | null {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Store auth data
 */
export function storeAuth(data: AuthResponse): void {
  localStorage.setItem('auth_token', data.token);
  localStorage.setItem('auth_user', JSON.stringify(data.employee));
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}
