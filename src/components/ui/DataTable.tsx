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
  variant?: 'pos' | 'inventory';
  manualPagination?: boolean;
  pageCount: number;
  pageSizeOptions?: number[];
  onRowSelect?: (row: TData) => void;
  emptyState?: string;
  pageFun: (pageableRequest: PageableRequest) => void;
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
  variant = 'inventory', // default
}: DataTableProps<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0] ?? 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
  });

  useEffect(() => {
    if (manualPagination && pageFun) {
      pageFun({
        page: pagination.pageIndex,
        size: pagination.pageSize,
      });
    }
  }, [pagination.pageIndex, pagination.pageSize, manualPagination, pageFun]);

  // ✅ Clases por variant
  const styles = {
    tableWrapper: `rounded-lg border overflow-hidden ${
      variant === 'pos' ? 'border-border' : 'border-gray-300'
    }`,
    thead: variant === 'pos'
      ? 'bg-blue-500 hover:text-gray-900 text-white sticky top-0 z-10' // letra gris/negra
      : 'bg-gray-300 text-gray-950 sticky top-0 z-10',

    row: (index: number) =>
      `cursor-pointer transition ${
        variant === 'pos'
          ? `hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} border-b border-border/30`
          : `hover:bg-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`
      }`,
    cell: variant === 'pos' ? 'text-sm text-secondary' : 'text-xs text-gray-700',
    badge: variant === 'pos' ? 'inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold' : 'inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium',
    paginationBtn: `rounded-full border px-3 py-1 transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 ${
      variant === 'pos' ? 'border-border' : 'border-gray-300'
    }`,
    pageSizeSelect: `rounded-md border bg-white px-3 py-1 ${
      variant === 'pos' ? 'border-border' : 'border-gray-300'
    }`,
  };

  return (
    <div className="space-y-4">
      <div className={styles.tableWrapper}>
        <Table>
          <TableHeader className={styles.thead}>
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
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  className={styles.row(rowIndex)}
                  onClick={() => onRowSelect?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={styles.cell}>
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
      <div className="flex flex-col gap-3 border-t pt-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <select
            className={styles.pageSizeSelect}
            value={pagination.pageSize}
            onChange={(event) =>
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(event.target.value),
                pageIndex: 0,
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
            className={styles.paginationBtn}
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
            className={styles.paginationBtn}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
