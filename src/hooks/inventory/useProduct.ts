import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProducts,
  getProductsByKeyWord,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type ProductCreatePayload,
  type ProductUpdatePayload,
  type ProductQueryParams,
  type ProductSummary,
} from "@/services/api/products";
import { Pageable } from "@/services/api/client";

export type UpsertPayload = ProductCreatePayload & { id?: string };

export function useProducts(params: ProductQueryParams & { keyWord?: string }) {
  const qc = useQueryClient();

  const queryFn = params.keyWord
    ? () => getProductsByKeyWord(params.keyWord!, params.pageableRequest!)
    : () => getAllProducts(params);

  const { data, isLoading: isLoadingProducts, isFetching, ...queryRest } =
    useQuery<Pageable<ProductSummary>, Error>({
      queryKey: params.keyWord
        ? ["products-keyword", params.keyWord, params.pageableRequest]
        : ["products", params],
      queryFn,
      placeholderData: (prev) => prev,
      staleTime: 10 * 60 * 1000, // 10 minutos frescos
      gcTime: 30 * 60 * 1000, // cache vive 30 minutos aunque nadie la use
    });

  const products= data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  // --- CREATE ---
  const create = useMutation({
    mutationFn: (payload: ProductCreatePayload) => createProduct(payload),
    onSuccess: (createdProduct) => {
      qc.setQueryData<Pageable<Product>>(
        params.keyWord
          ? ["products-keyword", params.keyWord, params.pageableRequest]
          : ["products", params],
        (prev) => {
          if (!prev) return prev;
          return { ...prev, content: [createdProduct, ...prev.content] };
        }
      );
    },
  });

  // --- UPDATE ---
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdatePayload }) =>
      updateProduct(id, payload),
    onSuccess: (updatedProduct) => {
      qc.setQueryData<Pageable<Product>>(
        params.keyWord
          ? ["products-keyword", params.keyWord, params.pageableRequest]
          : ["products", params],
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            content: prev.content.map((p) =>
              p.id === updatedProduct.id ? updatedProduct : p
            ),
          };
        }
      );
    },
  });

  // --- DELETE ---
  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Pageable<Product>>(
        params.keyWord
          ? ["products-keyword", params.keyWord, params.pageableRequest]
          : ["products", params],
        (prev) => {
          if (!prev) return prev;
          return { ...prev, content: prev.content.filter((p) => p.id !== id) };
        }
      );
    },
  });

  // 👇 Guardar producto (insert/update)
  const saveProduct = async (payload: UpsertPayload) => {
    if (payload.id) {
      return await update.mutateAsync({ id: payload.id, payload: payload as ProductUpdatePayload });
    }
    return await create.mutateAsync(payload as ProductCreatePayload);
  };

  const isLoading =
    isLoadingProducts || create.isPending || update.isPending || remove.isPending;

  return {
    products,
    saveProduct,
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
  };
}
