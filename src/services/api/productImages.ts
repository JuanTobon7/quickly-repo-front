import api from "./client";

export interface ProductImage {
  id: string;
  product: {
    id: string;
    barCode?: string;
    name?: string;
    [key: string]: any;
  };
  filePath: string;
  mainImage: boolean;
}

const BASE_URL = "/products";

/**
 * Upload image for a product
 * @param productId - Product UUID
 * @param file - Image file to upload (max 10MB, JPEG/PNG/GIF/WEBP)
 * @param isMainImage - Whether this is the main product image
 * @returns ProductImage object with id, filePath, mainImage flag
 */
export async function uploadProductImage(
  productId: string,
  file: File,
  isMainImage: boolean = false
): Promise<ProductImage> {
  // Validate file size (10MB limit)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(
      `El archivo supera el límite de 10 MB. Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`
    );
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Formato no soportado. Use JPEG, PNG, GIF o WEBP. Tipo recibido: ${file.type}`
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("mainImage", String(isMainImage));

  try {
    // No establecer Content-Type manualmente - axios lo hace automáticamente con el boundary correcto
    const response = await api.post<ProductImage>(
      `${BASE_URL}/${productId}/images`,
      formData,
      {
        timeout: 60000, // 60 seconds timeout for upload
      }
    );

    // El interceptor devuelve ApiResponse: {success, status, message, data: ProductImage}
    const data = (response as any).data || response;
    
    return data as ProductImage;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error("Archivo vacío o parámetros incorrectos");
    } else if (error.response?.status === 401) {
      throw new Error("No autorizado. Por favor, inicia sesión nuevamente.");
    } else if (error.response?.status === 404) {
      throw new Error(`Producto no encontrado: ${productId}`);
    } else if (error.response?.status === 413) {
      throw new Error("El archivo es demasiado grande (máximo 10MB)");
    } else if (error.response?.status === 415) {
      throw new Error("Tipo de archivo no soportado. Solo se permiten imágenes");
    } else if (error.response?.status === 500) {
      throw new Error(error.response?.data || "Error al guardar la imagen");
    }
    throw new Error(error.message || "Error al subir la imagen");
  }
}

/**
 * Get all images for a product
 * @param productId - Product UUID
 * @returns Array of ProductImage objects (empty array if none found)
 */
export async function getProductImages(productId: string): Promise<ProductImage[]> {
  try {
    const response = await api.get<ProductImage[]>(
      `${BASE_URL}/${productId}/images`
    );
    
    // El interceptor devuelve ApiResponse, así que response.data contiene los datos
    // Si response es ApiResponse: response = {success, status, message, data: ProductImage[]}
    // Si no, response.data contiene directamente el array
    const data = (response as any).data || response;
    
    // Asegurar que siempre devolvemos un array
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('❌ Error getting product images:', error);
    // If 404, product has no images yet - return empty array
    if (error.response?.status === 404 || error.status === 404) {
      return [];
    }
    // For other errors, throw to be handled by caller
    throw new Error(error.message || "Error al obtener las imágenes");
  }
}

/**
 * Delete a product image
 * @param productId - Product UUID
 * @param imageId - Image UUID
 */
export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  try {
    await api.delete(`${BASE_URL}/${productId}/images/${imageId}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Imagen no encontrada");
    }
    throw new Error(error.message || "Error al eliminar la imagen");
  }
}

/**
 * Set an image as the main product image
 * @param productId - Product UUID
 * @param imageId - Image UUID
 */
export async function setMainProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  try {
    await api.put(`${BASE_URL}/${productId}/images/${imageId}/main`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Imagen no encontrada");
    }
    throw new Error(error.message || "Error al marcar como principal");
  }
}

/**
 * Build full URL for displaying product image
 * @param filePath - Relative path from API (e.g., "product-images/550e8400_abc123.jpg")
 * @returns Full URL to display image
 */
export function getProductImageUrl(filePath: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
  return `${baseUrl}/${filePath}`;
}
