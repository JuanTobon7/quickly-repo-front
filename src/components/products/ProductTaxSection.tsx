import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tax } from '@/services/api/taxes';
import { useTaxes } from '@/hooks/inventory/useTaxes';
import { formatCurrency } from '@/utils/currency';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

export type PriceTaxData = {
  basePrice: number;
  priceIncludesTax: boolean;
  selectedTaxes: Tax[];
  priceBeforeTaxes: number;
  priceAfterTaxes: number;
};

type ProductTaxSectionProps = {
  initialBasePrice?: number;
  initialPriceIncludesTax?: boolean;
  initialSelectedTaxes?: Tax[];
  onChange: (data: PriceTaxData) => void;
};

export function ProductTaxSection({
  initialBasePrice = 0,
  initialPriceIncludesTax = false,
  initialSelectedTaxes = [],
  onChange,
}: ProductTaxSectionProps) {
  const [basePrice, setBasePrice] = useState(initialBasePrice);
  const [priceIncludesTax, setPriceIncludesTax] = useState(initialPriceIncludesTax);
  const [selectedTaxes, setSelectedTaxes] = useState<Tax[]>(initialSelectedTaxes);
  const [showTaxSelector, setShowTaxSelector] = useState(false);

  const { taxes: availableTaxes = [] } = useTaxes();

  // Filter taxes for sales only
  const salesTaxes = availableTaxes.filter((tax) => tax.forSales);

  // Calculate prices based on whether base price includes taxes
  const calculatePrices = () => {
    if (basePrice <= 0) {
      return { priceBeforeTaxes: 0, priceAfterTaxes: 0 };
    }

    const totalTaxRate = selectedTaxes.reduce((sum, tax) => sum + tax.rate, 0);

    if (priceIncludesTax) {
      // Price includes taxes, calculate price before taxes
      const priceBeforeTaxes = basePrice / (1 + totalTaxRate);
      return {
        priceBeforeTaxes,
        priceAfterTaxes: basePrice,
      };
    } else {
      // Price doesn't include taxes, calculate price after taxes
      const priceAfterTaxes = basePrice * (1 + totalTaxRate);
      return {
        priceBeforeTaxes: basePrice,
        priceAfterTaxes,
      };
    }
  };

  const { priceBeforeTaxes, priceAfterTaxes } = calculatePrices();

  // Notify parent of changes
  useEffect(() => {
    onChange({
      basePrice,
      priceIncludesTax,
      selectedTaxes,
      priceBeforeTaxes,
      priceAfterTaxes,
    });
  }, [basePrice, priceIncludesTax, selectedTaxes, priceBeforeTaxes, priceAfterTaxes]);

  const addTax = (tax: Tax) => {
    if (selectedTaxes.find((t) => t.id === tax.id)) {
      toast.warning('Este impuesto ya está agregado');
      return;
    }
    setSelectedTaxes([...selectedTaxes, tax]);
    setShowTaxSelector(false);
    toast.success(`Impuesto ${tax.name} agregado`);
  };

  const removeTax = (taxId: string) => {
    setSelectedTaxes(selectedTaxes.filter((t) => t.id !== taxId));
    toast.info('Impuesto removido');
  };

  const totalTaxRate = selectedTaxes.reduce((sum, tax) => sum + tax.rate, 0);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-4">
      <h4 className="text-sm font-semibold text-secondary">Configuración de Impuestos</h4>

      {/* Base Price Input */}
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">
          Precio Base <span className="text-red-500">*</span>
        </label>
        <CurrencyInput
          value={basePrice}
          onChange={setBasePrice}
          placeholder="Ingrese el precio"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold"
        />
      </div>

      {/* Price Includes Tax Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="priceIncludesTax"
          checked={priceIncludesTax}
          onChange={(e) => setPriceIncludesTax(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        <label htmlFor="priceIncludesTax" className="text-sm text-secondary">
          El precio base ya incluye impuestos
        </label>
      </div>

      {/* Tax Selector */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-secondary">Impuestos Aplicables</label>
          <button
            type="button"
            onClick={() => setShowTaxSelector(!showTaxSelector)}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" />
            Agregar
          </button>
        </div>

        {/* Tax Dropdown */}
        {showTaxSelector && (
          <div className="mb-2 rounded-lg border border-border bg-gray-50 p-2">
            {salesTaxes.length === 0 ? (
              <p className="text-xs text-muted">No hay impuestos de venta configurados</p>
            ) : (
              <div className="space-y-1">
                {salesTaxes.map((tax) => (
                  <button
                    key={tax.id}
                    type="button"
                    onClick={() => addTax(tax)}
                    className="w-full rounded bg-white px-3 py-2 text-left text-sm hover:bg-blue-50"
                  >
                    {tax.name} ({(tax.rate * 100).toFixed(2)}%)
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Taxes */}
        {selectedTaxes.length === 0 ? (
          <p className="text-xs text-muted">No hay impuestos seleccionados</p>
        ) : (
          <div className="space-y-2">
            {selectedTaxes.map((tax) => (
              <div
                key={tax.id}
                className="flex items-center justify-between rounded-lg border border-border bg-gray-50 px-3 py-2"
              >
                <div>
                  <span className="text-sm font-medium text-secondary">{tax.name}</span>
                  <span className="ml-2 text-xs text-muted">
                    {(tax.rate * 100).toFixed(2)}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeTax(tax.id)}
                  className="rounded bg-red-100 p-1 text-red-600 hover:bg-red-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Summary */}
      {basePrice > 0 && (
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Tasa total de impuestos:</span>
            <span className="font-semibold text-blue-600">
              {(totalTaxRate * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Precio antes de impuestos:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(priceBeforeTaxes)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Precio después de impuestos:</span>
            <span className="font-bold text-primary">
              {formatCurrency(priceAfterTaxes)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
