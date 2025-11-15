import { useState } from 'react';
import { X, FileDown, FileSpreadsheet } from 'lucide-react';
import { GenericDropdown } from '../ui/DropDown';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: ExportFilters, format: 'pdf' | 'excel') => void;
  brands: Array<{ id: string; name: string }>;
  productLines: Array<{ id: string; name: string }>;
  measurementUnits: Array<{ id: string; name: string }>;
  priceLevels: Array<{ name: string }>;
  isExporting: boolean;
}

export interface ExportFilters {
  brandId?: string;
  productLineId?: string;
  measurementId?: string;
  priceLevel?: string;
}

export type ExportFormat = 'pdf' | 'excel';

export const ExportPdfModal = ({
  isOpen,
  onClose,
  onExport,
  brands,
  productLines,
  measurementUnits,
  priceLevels,
  isExporting,
}: ExportPdfModalProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedLine, setSelectedLine] = useState<string | undefined>();
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | undefined>();
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<string | undefined>();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({
      brandId: selectedBrand,
      productLineId: selectedLine,
      measurementId: selectedMeasurement,
      priceLevel: selectedPriceLevel,
    }, selectedFormat);
  };

  const handleClear = () => {
    setSelectedBrand(undefined);
    setSelectedLine(undefined);
    setSelectedMeasurement(undefined);
    setSelectedPriceLevel(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary">Exportar Catálogo</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-gray-100"
            disabled={isExporting}
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Formato de exportación
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedFormat('pdf')}
              disabled={isExporting}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                selectedFormat === 'pdf'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-300 text-gray-700 hover:border-primary/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FileDown className="h-5 w-5" />
              PDF
            </button>
            <button
              onClick={() => setSelectedFormat('excel')}
              disabled={isExporting}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                selectedFormat === 'excel'
                  ? 'border-green-600 bg-green-50 text-green-600'
                  : 'border-gray-300 text-gray-700 hover:border-green-600/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FileSpreadsheet className="h-5 w-5" />
              Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <p className="text-sm text-gray-600">
            Selecciona los filtros para exportar productos específicos (opcional):
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Brand Filter */}
            <GenericDropdown
              label="Marca"
              options={brands.map(b => ({ label: b.name, value: b.id }))}
              value={selectedBrand}
              onChange={setSelectedBrand}
              placeholder="Todas las marcas"
              disabled={isExporting}
            />

            {/* Product Line Filter */}
            <GenericDropdown
              label="Línea de Producto"
              options={productLines.map(pl => ({ label: pl.name, value: pl.id }))}
              value={selectedLine}
              onChange={setSelectedLine}
              placeholder="Todas las líneas"
              disabled={isExporting}
            />

            {/* Measurement Unit Filter */}
            <GenericDropdown
              label="Unidad de Medida"
              options={measurementUnits.map(mu => ({ label: mu.name, value: mu.id }))}
              value={selectedMeasurement}
              onChange={setSelectedMeasurement}
              placeholder="Todas las unidades"
              disabled={isExporting}
            />

            {/* Price Level */}
            <GenericDropdown
              label="Nivel de Precio"
              options={priceLevels.map(pl => ({ label: pl.name, value: pl.name }))}
              value={selectedPriceLevel}
              onChange={setSelectedPriceLevel}
              placeholder="P/Especial"
              disabled={isExporting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClear}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            disabled={isExporting}
          >
            Limpiar Filtros
          </button>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            disabled={isExporting}
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:translate-y-[1px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50 ${
              selectedFormat === 'pdf' 
                ? 'bg-primary shadow-primary/30' 
                : 'bg-green-600 shadow-green-600/30'
            }`}
          >
            {selectedFormat === 'pdf' ? (
              <FileDown className="h-4 w-4" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {isExporting ? 'Exportando...' : `Exportar ${selectedFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};
