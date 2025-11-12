// src/services/api/product.ts
import { toast } from "sonner"
import api, { Pageable, PageableRequest } from "./client"
import { Brand } from "./brands"
import { Measurement } from "./measurementUnits"
import { ProductLine } from "./productLines"
import { PriceScale } from "./priceScales"

export type Product = {
  id: string
  code?: string
  barCode: string
  name: string
  description: string
  productLine: ProductLine
  brand: Brand
  measurement: Measurement
  reference: string
  priceScale?: PriceScale
  roundingEnabled: boolean
  cost: number
}

export type ProductCreatePayload = {
  barCode: string
  name: string
  description: string
  productLineId: string
  brandId: string
  measurementId: string
  reference: string
  priceScaleId?: string
  roundingEnabled: boolean
  cost: number
}
export type ProductUpdatePayload = ProductCreatePayload
export type ProductQueryParams = { 
  brandId?: string
  productLineId?: string
  measurementId?: string,
  pageableRequest?: PageableRequest,
  name?: string,
  barCode?: string,
  reference?: string,
  code?: string
}
const baseUrl = "/inventory/products"

export async function getAllProducts(params: ProductQueryParams = {}): Promise<Pageable<Product>> {
  const { brandId, productLineId, measurementId, pageableRequest, barCode, reference, code, name } = params

  const query = new URLSearchParams()
  query.append("size", pageableRequest.size.toString())
  query.append("page", pageableRequest.page.toString())
  if (brandId) query.append("brandId", brandId)
  if (productLineId) query.append("productLineId", productLineId)
  if (measurementId) query.append("measurementId", measurementId)
  if(barCode) query.append("barCode", barCode)
  if(reference) query.append("reference", reference)
  if(code) query.append("code", code)
  if(name) query.append("name", name)

  const { data } = await api.get<Pageable<Product>>(`${baseUrl}?${query.toString()}`)
  return data
}

// ✅ Obtener un producto por id
export async function getProductById(id: string): Promise<Product> {
  const { data } = await api.get<Product>(`${baseUrl}/${id}`)
  return data
}

// ✅ Crear un producto
export async function createProduct(payload: ProductCreatePayload): Promise<Product> {
  const { data } = await api.post<Product>(baseUrl, payload)
  toast.success("Producto creado correctamente")
  return data
}

// ✅ Actualizar un producto
export async function updateProduct(id: string, payload: ProductUpdatePayload): Promise<Product> {
  const { data } = await api.put<Product>(`${baseUrl}/${id}`, payload)
  toast.success("Producto actualizado correctamente")
  return data
}

// ✅ Eliminar un producto
export async function deleteProduct(id: string): Promise<boolean> {
  await api.delete(`${baseUrl}/${id}`)
  toast.success("Producto eliminado correctamente")
  return true
}
