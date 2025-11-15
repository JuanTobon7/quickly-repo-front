import { toast } from 'sonner';
import BrandSection from '../components/parameterization/BrandSection';
import ProductLineSection from '../components/parameterization/ProductLineSection';
import SupplierSection from '../components/parameterization/ProviderSection';
import MeasurementUnitSection from '../components/parameterization/MeasurementUnitSection';
import { TaxSection } from '../components/parameterization/TaxSection';
import { useState, useEffect } from 'react';
import { providerType } from '@/types/providers';
import GroupTypeSection from '@/components/parameterization/GroupTypeSection';
import { useSystemMetadata } from '@/hooks/inventory/useSystemMetadata';

import { startParametersTour } from '@/config/parametersTour';
import { HelpCircle } from 'lucide-react';

const ParametersView = () => {
  const { systemMetadata, isLoading, updateSystemMetadata } = useSystemMetadata();

  const [minimumProfitPercentage, setMinimumProfitPercentage] = useState<number>(10);
  const [roundingValue, setRoundingValue] = useState<number>(100);
  const [roundingEnabled, setRoundingEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (systemMetadata) {
      setMinimumProfitPercentage(systemMetadata.minimumProfitPercentage);
      setRoundingValue(systemMetadata.roundingValue);
      setRoundingEnabled(systemMetadata.roundingEnabled);
    }
  }, [systemMetadata]);

  const handleSaveSystemMetadata = async () => {
    if (!systemMetadata?.id) {
      toast.error('No se pudo cargar la configuración del sistema');
      return;
    }
    try {
      await updateSystemMetadata(systemMetadata.id, {
        minimumProfitPercentage,
        roundingValue,
        roundingEnabled,
      });
      toast.success('Parámetros guardados correctamente');
    } catch (error) {
      toast.error('Error al guardar los parámetros');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <section className="h-auto w-full space-y-6 rounded-3xl border border-border/60 bg-white p-8 shadow-soft">
        <p className="text-center text-muted">Cargando configuración del sistema...</p>
      </section>
    );
  }

  return (
    <section className="h-auto w-full pb-4 md:pb-8">
      <div className='p-4 md:p-8 shadow-soft space-y-6 rounded-3xl border 
    border-border/60 bg-white '>
        <header className="parameters-header border-b border-border pb-4 relative">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
            <div>
              <h2 className="text-xl font-semibold text-secondary">Parámetros de Inventario</h2>
              <p className="text-sm text-muted">Configure los parámetros generales del módulo de inventarios</p>
            </div>
            <button
              onClick={startParametersTour}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:shadow-md self-start md:self-auto"
              title="Iniciar tutorial"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Ayuda</span>
            </button>
          </div>
        </header>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Configuración General */}
          <div className="space-y-4 w-full">
            <h3 className="font-semibold text-secondary">Configuración General</h3>
            <div className="space-y-2 valuation-method">
              <label className="text-sm font-medium text-secondary">Método de valoración</label>
              <select className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm">
                <option>Promedio ponderado</option>
                <option>PEPS (Primero en entrar, primero en salir)</option>
                <option>UEPS (Último en entrar, primero en salir)</option>
              </select>
            </div>

            <div className="space-y-2 price-rounding">
              <label className="text-sm font-medium text-secondary">Redondeo de precios</label>
              <input 
                type="number" 
                value={roundingValue}
                onChange={(e) => setRoundingValue(parseInt(e.target.value) || 100)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                min="1"
                step="50"
              />
              <p className="text-xs text-muted">Redondear precios a múltiplos de este valor (ej: 100, 500, 1000)</p>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="roundingEnabled"
                checked={roundingEnabled}
                onChange={(e) => setRoundingEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border" 
              />
              <label htmlFor="roundingEnabled" className="text-sm text-secondary">Habilitar redondeo de precios</label>
            </div>

            <div className="space-y-2 minimum-profit">
              <label className="text-sm font-medium text-secondary">Utilidad mínima (%)</label>
              <input 
                type="number" 
                value={minimumProfitPercentage}
                onChange={(e) => setMinimumProfitPercentage(parseFloat(e.target.value) || 10)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                min="0"
                step="0.1"
              />
              <p className="text-xs text-muted">Porcentaje mínimo de utilidad permitido en todos los productos</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 auto-code-checkbox">
              <input type="checkbox" id="autoCode" className="h-4 w-4 rounded border-border" />
              <label htmlFor="autoCode" className="text-sm text-secondary">Generar código automáticamente</label>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 negative-stock-checkbox">
              <input type="checkbox" id="stockNegative" className="h-4 w-4 rounded border-border" />
              <label htmlFor="stockNegative" className="text-sm text-secondary">Permitir stock negativo</label>
            </div>
          </div>

          {/* Alertas de Inventario */}
          <div className="space-y-4 w-full">
            <h3 className="font-semibold text-secondary">Alertas de Inventario</h3>
            <div className="space-y-2 min-stock">
              <label className="text-sm font-medium text-secondary">Stock mínimo por defecto</label>
              <input 
                type="number" 
                defaultValue="5"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2 max-stock">
              <label className="text-sm font-medium text-secondary">Stock máximo por defecto</label>
              <input 
                type="number" 
                defaultValue="100"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 low-stock-alert">
              <input type="checkbox" id="lowStockAlert" defaultChecked className="h-4 w-4 rounded border-border" />
              <label htmlFor="lowStockAlert" className="text-sm text-secondary">Alertas de stock bajo</label>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 expiration-alert">
              <input type="checkbox" id="expirationAlert" className="h-4 w-4 rounded border-border" />
              <label htmlFor="expirationAlert" className="text-sm text-secondary">Alertas de vencimiento</label>
            </div>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="brand-section"><BrandSection /></div>
          <div className="product-line-section"><ProductLineSection /></div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 overflow-x-auto">
          <div className="supplier-section"><SupplierSection /></div>
          <div className="group-type-section"><GroupTypeSection /></div>
          <div className="unit-measure-section"><MeasurementUnitSection/></div>
        </div>

        <div className="grid gap-6 grid-cols-1">
          <div className="tax-section"><TaxSection /></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-border pt-4">
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary transition hover:bg-gray-50">
            Cancelar
          </button>
          <button 
            onClick={handleSaveSystemMetadata}
            className="save-button rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </section>
  );
};

export default ParametersView;
