import { useState, useEffect, memo, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tax } from '@/services/api/taxes';
import { useTaxes } from '@/hooks/inventory/useTaxes';
import { formatCurrency } from '@/utils/currency';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

export type PriceTaxData = {
  basePrice: number;
  priceIncludesTax: boolean;
  selectedTax: Tax | null;
  priceBeforeTaxes: number;
  priceAfterTaxes: number;
};

type ProductTaxSectionProps = {
  initialBasePrice?: number;
  initialPriceIncludesTax?: boolean;
  initialSelectedTax?: Tax | null;
  onChange: (data: PriceTaxData) => void;
};

export function ProductTaxSection({
  initialBasePrice = 0,
  initialPriceIncludesTax,
  initialSelectedTax,
  onChange,
}: ProductTaxSectionProps) {
  const [basePrice, setBasePrice] = useState(initialBasePrice);
  const [priceIncludesTax, setPriceIncludesTax] = useState(initialPriceIncludesTax);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(initialSelectedTax);
  const [showTaxSelector, setShowTaxSelector] = useState(false);

  // Usar ref para evitar notificaciones innecesarias
  const lastNotifiedData = useRef<string>('');

  const { taxes: availableTaxes = [] } = useTaxes();

  const salesTaxes = availableTaxes.filter((tax) => tax.forSales);

  // Sync props
  useEffect(() => setBasePrice(initialBasePrice), [initialBasePrice]);
  useEffect(() => setPriceIncludesTax(initialPriceIncludesTax), [initialPriceIncludesTax]);
  useEffect(() => setSelectedTax(initialSelectedTax), [initialSelectedTax]);

  // Calculations
  const taxRate = selectedTax?.rate ?? 0;

  const calculatePrices = () => {
    if (basePrice <= 0) return { priceBeforeTaxes: 0, priceAfterTaxes: 0 };

    if (priceIncludesTax) {
      const priceBeforeTaxes = basePrice / (1 + taxRate);
      return { priceBeforeTaxes, priceAfterTaxes: basePrice };
    } else {
      const priceAfterTaxes = basePrice * (1 + taxRate);
      return { priceBeforeTaxes: basePrice, priceAfterTaxes };
    }
  };

  const { priceBeforeTaxes, priceAfterTaxes } = calculatePrices();

  // Notify parent - solo cuando los valores realmente cambien
  useEffect(() => {
    const currentData = JSON.stringify({
      basePrice,
      priceIncludesTax,
      selectedTax: selectedTax?.id,
      priceBeforeTaxes: Math.round(priceBeforeTaxes * 100) / 100,
      priceAfterTaxes: Math.round(priceAfterTaxes * 100) / 100,
    });
    
    // Solo notificar si los datos realmente cambiaron
    if (currentData !== lastNotifiedData.current) {
      lastNotifiedData.current = currentData;
      onChange({
        basePrice,
        priceIncludesTax,
        selectedTax,
        priceBeforeTaxes,
        priceAfterTaxes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrice, priceIncludesTax, selectedTax?.id, priceBeforeTaxes, priceAfterTaxes]);

  const addTax = (tax: Tax) => {
    setSelectedTax(tax);
    setShowTaxSelector(false);
    toast.success(`Impuesto ${tax.name} aplicado`);
  };

  const removeTax = () => {
    setSelectedTax(null);
    toast.info("Impuesto removido");
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-4">
      <h4 className="text-sm font-semibold text-secondary">Configuración de Impuestos</h4>

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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-secondary">Impuesto Aplicable</label>
          <button
            type="button"
            onClick={() => setShowTaxSelector(!showTaxSelector)}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" />
            Seleccionar
          </button>
        </div>

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
                    {tax.name} ({(tax?.rate * 100).toFixed(2)}%)
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTax ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-gray-50 px-3 py-2">
            <div>
              <span className="text-sm font-medium text-secondary">{selectedTax.name}</span>
              <span className="ml-2 text-xs text-muted">
                {(selectedTax?.rate * 100).toFixed(2)}%
              </span>
            </div>
            <button
              type="button"
              onClick={removeTax}
              className="rounded bg-red-100 p-1 text-red-600 hover:bg-red-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted">No hay impuesto seleccionado</p>
        )}
      </div>

      {basePrice > 0 && (
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">Tasa de impuesto:</span>
            <span className="font-semibold text-blue-600">
              {(taxRate * 100).toFixed(2)}%
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

export default memo(ProductTaxSection);
