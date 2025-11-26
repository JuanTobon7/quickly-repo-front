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
  baseURL: baseURL || "https://viddefe.com/api/v1",
  // NO configurar Content-Type por defecto - axios lo detectará automáticamente
  // (application/json para objetos, multipart/form-data para FormData, etc.)
});

// ---------------------------------------------------------
// Interceptores globales
// ---------------------------------------------------------

// Interceptor de request para añadir el token de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Si no es FormData y no tiene Content-Type, usar application/json
    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Si es una respuesta de tipo blob (archivo binario), devolverla tal cual
    if (response.config.responseType === 'blob') {
      return response;
    }

    const res = response.data as ApiResponse<any>;

    // Si cumple estructura de ApiResponse (backend con wrapper estándar)
    if (res && typeof res.success === "boolean" && res.hasOwnProperty('data')) {
      // 🔧 decodificar cualquier campo escapado (seguridad OWASP)
      res.data = decodeHtmlEntities(res.data);
      res.message = decodeHtmlEntities(res.message);

      if (res.success) {
        // Mostrar toast solo si tiene mensaje útil
        if (res.message && !["OK", "Created", "No Content"].includes(res.message)) {
          toast.success(res.message);
        }
        // Devolver la data envuelta en el objeto response para que axios la acceda con response.data
        return { ...response, data: res.data };
      } else {
        // Error controlado por el backend
        toast.error(res.message || "Error en la operación");
        return Promise.reject(res as ApiError);
      }
    }

    // Si NO es ApiResponse (respuesta directa como array o objeto plano), decodificar y devolver
    response.data = decodeHtmlEntities(response.data);
    return response;
  },
  (error) => {
    // Errores del servidor o red
    if (error.response) {
      const { data, status } = error.response;
      
      // Manejo especial para 401 (No autorizado)
      if (status === 401) {
        const url = error.config?.url || '';
        // Solo considerar "opcional" el endpoint de procesamiento de imágenes
        // Los endpoints de productos/imágenes SÍ requieren autenticación
        const isOptionalImageEndpoint = url.includes('/images/process') || url.includes('/images/health');
        
        console.error('🚫 Error 401:', { url, isOptional: isOptionalImageEndpoint });
        
        // Si es el servicio de procesamiento de imágenes (opcional), no redirigir
        if (isOptionalImageEndpoint) {
          console.warn('Image processing service not available or not authenticated');
          toast.warning('Servicio de procesamiento de imágenes no disponible');
          return Promise.reject({
            success: false,
            status: 401,
            message: 'Servicio de procesamiento no disponible',
            errorCode: 'IMAGE_PROCESSING_UNAVAILABLE',
            timestamp: new Date().toISOString(),
          } as ApiError);
        }
        
        // Para otros endpoints (incluyendo upload de productos), limpiar sesión y redirigir
        console.error('🔐 Sesión expirada - redirigiendo a login');
        toast.error('Sesión expirada. Redirigiendo al login...');
        localStorage.clear();
        
        // Evitar redirección infinita si ya estamos en login
        if (!window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000); // Dar tiempo para que se vea el toast
        }
        
        return Promise.reject({
          success: false,
          status: 401,
          message: 'No autorizado',
          errorCode: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
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

      if (apiError.message === "Validation failed" && apiError.meta?.fields) {
        const fields = apiError.meta.fields;

        // Mostrar cada error de campo
        Object.values(fields).forEach((msg) => {
          toast.error(String(msg));
        });

        return Promise.reject(apiError);
      }

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