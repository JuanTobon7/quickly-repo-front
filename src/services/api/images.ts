import api from "./client";

export type ImageProcessOptions = {
  maxWidth?: number;
  quality?: number;
  removeBackground?: boolean;
  addWhiteBackground?: boolean;
};

export type ImageHealthResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    service: string;
    status: "available" | "unavailable";
  };
};

const baseUrl = "/images";

/**
 * Check if image processing service is available
 */
export async function checkImageServiceHealth(): Promise<ImageHealthResponse> {
  try {
    const response = await api.get(`${baseUrl}/health`);
    
    // El interceptor de axios ya retorna el objeto ApiResponse directamente
    // response = {success: true, status: 200, message: '...', data: {...}}
    return response as unknown as ImageHealthResponse;
  } catch (error) {
    console.error('Health check error:', error);
    return {
      success: false,
      status: 503,
      message: "Service is unavailable",
      data: {
        service: "image-processor",
        status: "unavailable",
      },
    };
  }
}

/**
 * Process an image (remove background, optimize, compress)
 * @param file - Image file to process (max 10MB, JPEG/PNG/WEBP)
 * @param options - Processing options
 * @returns Blob of processed WebP image
 */
export async function processImage(
  file: File,
  options: ImageProcessOptions = {}
): Promise<Blob> {
  // Validate file size (10MB limit)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`El archivo supera el límite de 10 MB. Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Formato no soportado. Use JPEG, PNG o WEBP. Tipo recibido: ${file.type}`);
  }

  const formData = new FormData();
  formData.append("file", file);

  // Add optional parameters with defaults
  if (options.maxWidth !== undefined) {
    formData.append("maxWidth", String(options.maxWidth));
  }
  if (options.quality !== undefined) {
    formData.append("quality", String(options.quality));
  }
  if (options.removeBackground !== undefined) {
    formData.append("removeBackground", String(options.removeBackground));
  }
  if (options.addWhiteBackground !== undefined) {
    formData.append("addWhiteBackground", String(options.addWhiteBackground));
  }

  try {
    
    const response = await api.post(`${baseUrl}/process`, formData, {
      // Axios detectará automáticamente que es FormData y configurará:
      // Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
      responseType: "blob",
      timeout: 60000, // 60 seconds timeout for image processing
    });
    
    // Response should be a Blob with image/webp content-type
    return response.data;
  } catch (error: any) {
    console.error('❌ Error procesando imagen:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      message: error.message
    });
    
    if (error.response?.status === 400) {
      throw new Error("Parámetros inválidos o archivo no válido");
    } else if (error.response?.status === 503) {
      throw new Error("Servicio de procesamiento no disponible. Intenta más tarde.");
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error("Sesión expirada o acceso denegado. Por favor, inicia sesión nuevamente.");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("El procesamiento está tomando demasiado tiempo. Intenta con una imagen más pequeña.");
    }
    throw new Error(error.message || "Error al procesar la imagen");
  }
}

/**
 * Create an object URL from a Blob for preview
 */
export function createImagePreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke an object URL to free memory
 */
export function revokeImagePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
