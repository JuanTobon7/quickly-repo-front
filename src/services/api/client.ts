import axios from "axios";
import { toast } from "sonner";

export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  errorCode?: string;
  data?: T;
  meta?: Record<string, any>;
  timestamp: string;
}

export interface ApiError {
  success: false;
  status: number;
  message: string;
  errorCode: string;
  meta?: {
    timestamp?: string;
    path?: string;
    traceId?: string;
    user?: string;
    fields?: Record<string, string>;
    violations?: Record<string, string>;
    [key: string]: any;
  };
  timestamp: string;
}

export type Pageable<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number       // página actual
  size: number         // tamaño de página
}

export type PageableRequest = {
  size: number
  page: number
}

// ---------------------------------------------------------
// Utilidades para decodificar HTML entities (auteco&#64;gmail.com → auteco@gmail.com)
// ---------------------------------------------------------
function decodeHtmlEntities(str: any): any {
  if (typeof str === "string") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
  }
  if (Array.isArray(str)) return str.map(decodeHtmlEntities);
  if (typeof str === "object" && str !== null)
    return Object.fromEntries(
      Object.entries(str).map(([k, v]) => [k, decodeHtmlEntities(v)])
    );
  return str;
}

// ---------------------------------------------------------
// Configuración base
// ---------------------------------------------------------
const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL && import.meta.env.MODE === "development") {
  console.warn("⚠️  Missing VITE_API_URL in .env");
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------
// Interceptor para agregar token de autenticación
// ---------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------
// Interceptores globales
// ---------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    // Si es una respuesta de tipo blob (archivo binario), devolverla tal cual
    if (response.config.responseType === 'blob') {
      return response;
    }

    const res = response.data as ApiResponse<any>;

    // Si cumple estructura de ApiResponse
    if (res && typeof res.success === "boolean") {
      // 🔧 decodificar cualquier campo escapado (seguridad OWASP)
      res.data = decodeHtmlEntities(res.data);
      res.message = decodeHtmlEntities(res.message);

      if (res.success) {
        // Mostrar toast solo si tiene mensaje útil
        if (res.message && !["OK", "Created", "No Content"].includes(res.message)) {
          toast.success(res.message);
        }
        return res;
      } else {
        // Error controlado por el backend
        toast.error(res.message || "Error en la operación");
        return Promise.reject(res as ApiError);
      }
    }

    // Si no es ApiResponse (ej: login que devuelve { token, type, employee })
    // decodificar igual por seguridad y devolver tal cual
    const decoded = decodeHtmlEntities(response.data);
    return decoded;
  },
  (error) => {
    // Errores del servidor o red
    if (error.response) {
      const { data, status } = error.response;
      
      // Handle 401 - Unauthorized (token expired or invalid)
      if (status === 401) {
        // Clear auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        // Only show toast and redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          window.location.href = '/login';
        }
        
        // Return early to avoid showing another toast
        return Promise.reject({
          success: false,
          status,
          message: decodeHtmlEntities(data?.message || "No autorizado"),
          errorCode: data?.errorCode || "UNAUTHORIZED",
          meta: decodeHtmlEntities(data?.meta),
          timestamp: data?.timestamp || new Date().toISOString(),
        } as ApiError);
      }
      
      const apiError: ApiError = {
        success: false,
        status,
        message: decodeHtmlEntities(data?.message || "Error inesperado del servidor"),
        errorCode: data?.errorCode || "INTERNAL_ERROR",
        meta: decodeHtmlEntities(data?.meta),
        timestamp: data?.timestamp || new Date().toISOString(),
      };
      
      toast.error(apiError.message);
      
      return Promise.reject(apiError);
    }

    // Error de red
    toast.error("No se pudo conectar con el servidor");
    return Promise.reject({
      success: false,
      status: 0,
      message: "Network Error",
      errorCode: "NETWORK_ERROR",
      timestamp: new Date().toISOString(),
    } as ApiError);
  }
);

export default api;