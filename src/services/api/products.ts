// src/services/api/product.ts
import { toast } from "sonner"
import api, { Pageable, PageableRequest } from "./client"
import { Brand } from "./brands"
import { Measurement } from "./measurementUnits"
import { ProductLine } from "./productLines"
import { Tax } from "./taxes"
import { GroupType } from "./groupType"

export type PriceLevel = {
  id?: string
  position: number
  name: string
  profitPercentage: number
  priceScaleNameId?: string
}

export type Product = {
  id: string
  code?: string
  barCode: string
  name: string
  description: string
  productLine: ProductLine
  brand: Brand
  groupTypeProduct: GroupType,
  measurement: Measurement
  reference: string
  priceLevels: PriceLevel[]
  roundingEnabled: boolean
  cost: number
  priceBeforeTaxes?: number
  priceAfterTaxes?: number
  taxes?: Tax
}

export type ProductCreatePayload = {
  barCode: string
  name: string
  description: string
  productLineId: string
  brandId: string
  measurementId: string
  groupId: string
  reference: string
  priceLevels: {
    priceScaleNameId: string
    profitPercentage: number
  }[]
  roundingEnabled: boolean
  cost: number
  priceBeforeTaxes?: number
  priceAfterTaxes?: number
  taxId: string
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
  code?: string,
  keyWord?: string 
}

export type ProductSummary = {
  id?: string,
  code: string
  reference: string
  name: string
  quantity: number
  cost: number
  priceSale: number,
  brand: string
}

const baseUrl = "/inventory/products"

export async function getAllProducts(
  params: ProductQueryParams = {}
): Promise<Pageable<ProductSummary>> {
  const { brandId, productLineId, measurementId, pageableRequest, barCode, reference, code, name } = params

  const query = new URLSearchParams()
  query.append("size", pageableRequest.size.toString())
  query.append("page", pageableRequest.page.toString())
  if (brandId) query.append("brandId", brandId)
  if (productLineId) query.append("productLineId", productLineId)
  if (measurementId) query.append("measurementId", measurementId)
  if (barCode) query.append("barCode", barCode)
  if (reference) query.append("reference", reference)
  if (code) query.append("code", code)
  if (name) query.append("name", name)

  const { data } = await api.get<Pageable<ProductSummary>>(
    `${baseUrl}?${query.toString()}`
  )

  return data
}
 export async function getProductsByKeyWord(
  keyWord: string,  pageableRequest: PageableRequest
 ): Promise<Pageable<ProductSummary>> {
  const query = new URLSearchParams();
  query.append("size", pageableRequest.size.toString())
  query.append("page", pageableRequest.page.toString())
  if(keyWord) query.append("keyWord", keyWord)
  const { data } = await api.get<Pageable<ProductSummary>>(
    `${baseUrl}?${query.toString()}`
  )

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

export async function importProducts(file: File): Promise<void> {
  const formData = new FormData()
  formData.append("file", file)
  await api.post(`${baseUrl}/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  toast.success("Productos importados correctamente")
}