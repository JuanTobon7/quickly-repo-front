import { memo } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/currency';
import { PercentageInput } from '@/components/ui/PercentageInput';

export type PriceLevel = {
  priceScaleNameId: string;
  position: number;
  name: string;
  profitPercentage: number;
  salePrice: number;
};

type ProductPricingTableProps = {
  levels: PriceLevel[];
  onProfitPercentageChange: (position: number, percentage: number) => void;
  onClearPrices: () => void;
};

export const ProductPricingTable = memo(({
  levels,
  onProfitPercentageChange,
  onClearPrices,
}: ProductPricingTableProps) => {
  return (
    <div className="price-scale-table mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-secondary">Niveles de Precio del Producto</h3>
        <div className="flex gap-2">
          <button
            onClick={onClearPrices}
            className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-warning/80"
          >
            Borrar Precios
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nivel</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Utilidad en (%)</TableHead>
              <TableHead>Venta Incluida (IVA)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.map((level) => (
              <TableRow key={level.position}>
                <TableCell>
                  <span className="font-semibold text-red-600">({level.position})</span>
                </TableCell>
                <TableCell className="price-level-name">
                  <span className="text-sm font-medium text-secondary">{level.name}</span>
                </TableCell>
                <TableCell className="price-profit-percentage">
                  <PercentageInput
                    value={level.profitPercentage}
                    onChange={(value) => onProfitPercentageChange(level.position, value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                    min={0}
                    max={1000}
                  />
                </TableCell>
                <TableCell className="price-sale-price">
                  <input
                    type="text"
                    value={formatCurrency(level.salePrice)}
                    readOnly
                    className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm font-semibold text-red-600"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

ProductPricingTable.displayName = 'ProductPricingTable';
