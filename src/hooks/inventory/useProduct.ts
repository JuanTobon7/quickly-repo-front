import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type ProductCreatePayload,
  type ProductUpdatePayload,
  ProductQueryParams,
} from "@/services/api/products"
import { Pageable } from "@/services/api/client"

type UpsertPayload = ProductCreatePayload & { id?: string }


export function useProducts(params: ProductQueryParams) {
  const qc = useQueryClient()

  const {
    data,
    isLoading: isLoadingProducts,
    isFetching,
    ...queryRest
  } = useQuery<Pageable<Product>, Error>({
    queryKey: ["products", params], // se actualiza si cambian filtros o size
    queryFn: () => getAllProducts(params),
    placeholderData: ((prev) => prev)
  })
  const products = data?.content ?? []
  
  const create = useMutation({
    mutationFn: (payload: ProductCreatePayload) => createProduct(payload),
    onSuccess: () => {
      // Invalidar todas las queries de productos para refrescar la lista
      qc.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdatePayload }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      // Invalidar todas las queries de productos para refrescar la lista
      qc.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      // Invalidar todas las queries de productos para refrescar la lista
      qc.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const setProduct = (payload: UpsertPayload) => {
    if (payload.id)
      return update.mutate({ id: payload.id, payload: payload as ProductUpdatePayload })
    return create.mutate(payload as ProductCreatePayload)
  }

  const isLoading = isLoadingProducts || create.isPending || update.isPending || remove.isPending

  return {
    products,
    setProduct,
    totalPages: data?.totalPages ?? 1,
    totalElements: data?.totalElements ?? 0,
    currentPage: data?.number ?? 0,
    remove,
    isLoading,
    isFetching,
    createMutation: create,
    updateMutation: update,
    removeMutation: remove,
    ...queryRest,
  }
}
