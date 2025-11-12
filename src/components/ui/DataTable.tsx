import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageableRequest } from '@/services/api/client';

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  manualPagination?: boolean;
  pageCount: number;
  pageSizeOptions?: number[];
  onRowSelect?: (row: TData) => void;
  emptyState?: string;
  pageFun: (pageableRequest: PageableRequest) => void; // 👈 función del padre
  isLoading?: boolean;
};

const DEFAULT_PAGE_SIZES = [5, 10, 25, 50];
const SKELETON_ROWS = 5;

function DataTable<TData>({
  columns,
  data,
  pageCount,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  manualPagination = false,
  pageFun,
  onRowSelect,
  emptyState = 'No hay registros para mostrar.',
  isLoading = false,
}: DataTableProps<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  });

  // ⚙️ Inicializa la tabla
  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination, // <- si es false, React Table maneja internamente
    pageCount: manualPagination ? pageCount : undefined,
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
  });

  // 🪄 Llama al padre cada vez que cambia la página o el tamaño
  useEffect(() => {
    if (manualPagination && pageFun) {
      pageFun({
        page: pagination.pageIndex,
        size: pagination.pageSize,
      });
    }
  }, [pagination.pageIndex, pagination.pageSize, manualPagination, pageFun]);


  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              [...Array(SKELETON_ROWS)].map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="animate-pulse">
                  <TableCell colSpan={columns.length}>
                    <div className="h-4 w-full rounded bg-border/60" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-muted" colSpan={columns.length}>
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onRowSelect?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔽 Footer con controles de paginación */}
      <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <select
            className="rounded-md border border-border bg-white px-3 py-1"
            value={pagination.pageSize}
            onChange={(event) =>
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(event.target.value),
                pageIndex: 0, // reset al cambiar tamaño
              }))
            }
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-full border border-border px-3 py-1 transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-xs uppercase tracking-wider text-muted">
            Página {pagination.pageIndex + 1}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-full border border-border px-3 py-1 transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
