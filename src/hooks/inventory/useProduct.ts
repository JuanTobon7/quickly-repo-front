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
  onSuccess: (newProduct: Product) => {
    qc.setQueryData<Pageable<Product>>(["products", params], (old) => {
      if (!old) return old

      return {
        ...old,
        content: [newProduct, ...old.content], // 👈 push visual inmediato
        totalElements: old.totalElements + 1,
      }
    })
  },
})

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdatePayload }) =>
      updateProduct(id, payload),
    onSuccess: (updatedProduct: Product) => {
      qc.setQueryData<Product[]>(["products", params], (old = []) =>
        old.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      )
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<Product[]>(["products", params], (old = []) =>
        old.filter((p) => p.id !== id)
      )
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
    ...queryRest,
  }
}
