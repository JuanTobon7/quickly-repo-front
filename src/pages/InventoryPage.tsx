import { useCallback, useEffect, useMemo, useState } from 'react';
import { set, useForm, type UseFormRegisterReturn } from 'react-hook-form';
import {
  ArrowDownToLine,
  ArrowRightLeft,
  FileDown,
  HelpCircle,
  Icon,
  LucideIcon,
  Printer,
  ScanLine,
  Search,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { startInventoryTour } from '@/config/inventoryTour';

import MainLayout from '../layout/MainLayout';
import ProductLayout from '../layout/ProductLayout';
import ProductEditForm from '../layout/ProductEditForm';
import ParametersView from '../layout/ParametersView';
import DataTable from '../components/ui/DataTable';
import { GenericDropdown } from '@/components/ui/DropDown';
import { useProductLines } from '@/hooks/inventory/useProductLines';
import { useGroupTypes } from '@/hooks/inventory/useGroupType';
import { useBrands } from '@/hooks/inventory/useBrands';
import { useMeasurementUnits } from '@/hooks/inventory/useMeasurementUnits';
import { usePriceScales } from '@/hooks/inventory/usePriceScales';
import { useProducts } from '@/hooks/inventory/useProduct';
import type { Product, ProductQueryParams } from '@/services/api/products';
import { PageableRequest } from '@/services/api/client';
import FilterInput from '@/components/forms/FilterInput';
import VoiceSearchInput from '@/components/forms/VoiceSearchInput';
import { BarcodeScanner } from '@/components/products/BarcodeScannerInput';
import { useDebounce } from '@/hooks/useDebounce';
import { ExportPdfModal, type ExportFilters } from '@/components/modals/ExportPdfModal';
import api from '@/services/api/client';
type FilterForm = {
  company: string;
  costCenter: string;
  group: string;
  line: string;
  category: string;
  brand: string;
  tax: string;
  barcode: string;
  code: string;
  reference: string;
  productName: string;
};

const MODULE_TABS = [
  { label: 'Productos', value: 'products' },
  { label: 'Compras', value: 'purchases' },
  { label: 'Ventas', value: 'sales' },
  { label: 'Kardex', value: 'kardex' },
  { label: 'Ajuste', value: 'adjustments' },
  { label: 'Valor inventario', value: 'inventory-value' },
  { label: 'Catálogo', value: 'catalog' },
  { label: 'El más vendido', value: 'best-sellers' },
  { label: 'Parámetro', value: 'parameters' },
] as const;

const formatCurrency = (value: number) =>
  value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const formatNumber = (value: number) => value.toLocaleString('es-CO');

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof MODULE_TABS)[number]['value']>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState<boolean|null>(null);
  // Estados individuales para cada dropdown
  const [selectedLine, setSelectedLine] = useState<string | undefined>();
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedMeasurementUnit, setSelectedMeasurementUnit] = useState<string | undefined>();
  const [selectedTax, setSelectedTax] = useState<string | undefined>();
  const [pageableRequest, setPageableRequest] = useState<PageableRequest>({ size: 10, page: 0 });
  const { register, handleSubmit, reset, watch, setValue } = useForm<FilterForm>({
    defaultValues: {
      company: 'EL MAYORISTA SAS',
      costCenter: '',
      group: '',
      line: '',
      category: '',
      brand: '',
      tax: 'IVA 19%',
      barcode: '',
      code: '',
      reference: '',
      productName: '',
    },
  });
  const handleScan = (code: string) => {
    setValue('barcode', code)
    setIsScanning(false)
  }

  const debouncedProductName = useDebounce(watch('productName'), 150)
  const debouncedReference = useDebounce(watch('reference'), 150)
  const debouncedCode = useDebounce(watch('code'), 150)
  const debouncedBarCode = useDebounce(watch('barcode'), 150)
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [params, setParams] = useState<ProductQueryParams>({
    brandId: selectedBrand,
    productLineId: selectedLine,
    measurementId: selectedMeasurementUnit,
    pageableRequest: pageableRequest,
    name: debouncedProductName,
    code: debouncedCode,
    reference: debouncedReference,
    barCode: debouncedBarCode
  })
  useEffect(()=>{
    setParams({
      brandId: selectedBrand,
      productLineId: selectedLine,
      measurementId: selectedMeasurementUnit,
      pageableRequest: pageableRequest,
      name: debouncedProductName,
      code: debouncedCode,
      reference: debouncedReference,
      barCode: debouncedBarCode
    })
  },[selectedBrand, selectedLine, 
    selectedMeasurementUnit, pageableRequest, 
    debouncedProductName, debouncedReference,
    debouncedCode, debouncedBarCode
  ])
  
  const {productLines} = useProductLines();
  const {groupTypes} = useGroupTypes();
  const { brands } = useBrands();
  const { measurementUnits } = useMeasurementUnits();
  const { priceScales } = usePriceScales();
  const { products, isLoading, totalPages } = useProducts(params);

  // Extraer todos los niveles de precio de todas las escalas
  const priceLevels = useMemo(() => {
    return priceScales.flatMap(scale => 
      scale.levels.map(level => ({ name: level.name }))
    );
  }, [priceScales]);

  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportPDF = async (filters: ExportFilters) => {
    try {
      setIsExporting(true);
      setShowExportModal(false);
      toast.loading('Generando catálogo PDF...', { id: 'pdf-export' });
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.brandId) params.append('brandId', filters.brandId);
      if (filters.measurementId) params.append('measurementId', filters.measurementId);
      if (filters.productLineId) params.append('productLineId', filters.productLineId);
      if (filters.priceLevel) params.append('priceLevel', filters.priceLevel);
      
      // Use axios with responseType blob
      const url = `/inventory/products/export/pdf${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url, {
        responseType: 'blob',
      });

      console.log('PDF Response:', response);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      console.log('Blob size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('El PDF generado está vacío');
      }
      
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `catalogo-productos-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      toast.dismiss('pdf-export');
      toast.success('Catálogo exportado exitosamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.dismiss('pdf-export');
      toast.error(error instanceof Error ? error.message : 'Error al exportar el catálogo');
    } finally {
      setIsExporting(false);
    }
  };
 
  const goBack = useCallback(()=> {
    setSelectedProduct(null);
    setIsNewProduct(null);
  },[])

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        cell: (info) => (
          <span className="font-medium text-secondary">{info.getValue<string>()}</span>
        ),
      },
      {
        header: 'Código de Barras',
        accessorKey: 'barCode',
        cell: (info) => <span className="text-secondary">{info.getValue<string>()}</span>,
      },
      {
        header: 'Nombre',
        accessorKey: 'name',
        cell: (info) => <span className="font-medium text-secondary">{info.getValue<string>()}</span>,
      },
      {
        header: 'Marca',
        accessorFn: (row) => row.brand.name,
        cell: (info) => <span className="text-secondary">{info.getValue<string>()}</span>,
      },
      {
        header: 'Línea',
        accessorFn: (row) => row.productLine.name,
        cell: (info) => <span className="text-secondary">{info.getValue<string>()}</span>,
      },
      {
        header: 'Unidad de Medida',
        accessorFn: (row) => row.measurement.name,
        cell: (info) => <span className="text-secondary">{info.getValue<string>()}</span>,
      },
      {
        header: 'Descripción',
        accessorKey: 'description',
        cell: (info) => <span className="text-secondary text-xs">{info.getValue<string>() || '-'}</span>,
      },
    ],
    []
  );

  const resetFilters = () => {
    setSelectedBrand(undefined);
    setSelectedLine(undefined);
    setSelectedMeasurementUnit(undefined);
    setSelectedGroup(undefined);
    setSelectedTax(undefined);
    reset();
    toast('Filtros restablecidos');
  };

  const formContent = (
    <form className="space-y-6">
      <header className="inventory-header border-b border-border pb-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
          <div>
            <h2 className="text-xl font-semibold text-secondary">Gestión de Inventario</h2>
            <p className="text-sm text-muted">Busca, filtra y administra tus productos</p>
          </div>
          <button
            type="button"
            onClick={startInventoryTour}
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:shadow-md self-start md:self-auto"
            title="Iniciar tutorial"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Ayuda</span>
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 items-center">
        <div className="filter-company">
          <FilterInput label="Empresa" register={register('company')} />
        </div>
        <div className="filter-line">
          <GenericDropdown
              label="Línea"
              options={productLines.map((line) => ({ label: line.name, value: line.id }))}
              value={selectedLine}
              onChange={(val) => {
                setSelectedLine(val);
                const selected = productLines.find(l => l.id === val);
                toast.success(`Línea seleccionada: ${selected?.name}`);
              }}
              placeholder="Selecciona una línea"
          />
        </div>
        <div className="filter-group">
          <GenericDropdown
              label="Grupo"
              options={groupTypes.map((line) => ({ label: line.name, value: line.id }))}
              value={selectedGroup}
              onChange={(val) => {
                setSelectedGroup(val);
                const selected = groupTypes.find(g => g.id === val);
                toast.success(`Grupo seleccionado: ${selected?.name}`);
              }}
              placeholder="Selecciona un grupo"
          />
        </div>
        <div className="filter-brand">
          <GenericDropdown
            label="Marca"
            options={brands.map((b) => ({ label: b.name, value: b.id }))}
            value={selectedBrand}
            onChange={(val) => {
              setSelectedBrand(val);
              const selected = brands.find(b => b.id === val);
              toast.success(`Marca seleccionada: ${selected?.name}`);
            }}
            placeholder="Selecciona una marca"
          />
        </div>
        <div className="filter-measurement">
          <GenericDropdown
              label="Unidad de Medida"
              options={measurementUnits.map((unit) => ({ label: unit.name, value: unit.id }))}
              value={selectedMeasurementUnit}
              onChange={(val) => {
                setSelectedMeasurementUnit(val);
                const selected = measurementUnits.find(u => u.id === val);
                toast.success(`Unidad seleccionada: ${selected?.name}`);
              }}
              placeholder="Selecciona una unidad"
          />
        </div>
        <div className="filter-tax">
          <GenericDropdown
              label="Impuesto"
              options={[
                { label: "Exento", value: "exento" },
                { label: "IVA 19%", value: "iva19" }
              ]}
              value={selectedTax}
              onChange={(val) => {
                setSelectedTax(val);
                const selected = val === "exento" ? "Exento" : "IVA 19%";
                toast.success(`Impuesto seleccionado: ${selected}`);
              }}
              placeholder="Selecciona un impuesto"
          />
        </div>
        <div className="filter-barcode">
          <FilterInput
            label="Código de barras"
            register={register('barcode')}
            placeholder="Escanear o escribir"
            icon={ScanLine}
            iconFun={() => setIsScanning(prev => !prev)}
          />  
          <BarcodeScanner
            isScanning={isScanning}
            onScan={handleScan}
            onClose={() => setIsScanning(false)}
          />
        </div>
        <div className="filter-code">
          <FilterInput label="Código" register={register('code')} />
        </div>
        <div className="filter-reference">
          <FilterInput label="Referencia" register={register('reference')} />
        </div>
        <div className="filter-product-name">
          <VoiceSearchInput 
            label="Nombre del producto" 
            register={register('productName')}
            setValue={setValue}
            fieldName="productName"
            placeholder="Buscar por nombre"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="btn-clear-filters inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-sm font-medium text-secondary transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowRightLeft className="h-4 w-4" /> Limpiar filtros
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(null)
              setIsNewProduct(true)
            }}
            className="btn-new-product inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:translate-y-[1px] hover:shadow-none"
          >
            <Star className="h-4 w-4" /> Nuevo
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            disabled={isExporting}
            className="btn-export inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:border-primary/40 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="h-4 w-4" /> {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
          <button
            type="button"
            onClick={() => toast('Enviando a impresión')}
            className="btn-print inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:border-primary/40 hover:text-primary"
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button>
          <button
            type="button"
            onClick={() => toast.success('Importación iniciada')}
            className="btn-import inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowDownToLine className="h-4 w-4" /> Importar
          </button>
        </div>
      </div>

      <div className="products-table rounded-3xl border border-border/70 bg-white/90 p-4 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold text-secondary">Catálogo de productos</h2>
        <DataTable<Product>
          columns={columns}
          pageCount={totalPages}
          manualPagination={true}
          pageFun={setPageableRequest}
          data={products}
          isLoading={isLoading}
          onRowSelect={setSelectedProduct}
          emptyState="No se encontraron productos con los filtros seleccionados."
        />
      </div>
    </form>
  );

  return (
    <MainLayout
      moduleName="Inventarios"
      tabs={MODULE_TABS.map(({ label, value }) => ({ label, value }))}
      activeTab={activeTab}
      onTabChange={(next) =>
        setActiveTab(next as (typeof MODULE_TABS)[number]['value'])
      }
      activeSidebar="inventory"
    >
      {activeTab === 'parameters' && 
        <ParametersView />
      }
      {activeTab !== 'parameters' && !(selectedProduct !== null || isNewProduct) &&
        <section className="h-auto w-full space-y-6 rounded-3xl border border-border/60 bg-white p-6 py-8 shadow-soft">
          {formContent}
        </section>
    }
      { (selectedProduct !== null || isNewProduct) && activeTab !== 'parameters' && (
        
        <ProductLayout
          isEditing={!isNewProduct}
          createView={
            (
              <ProductEditForm
                brands={brands}
                groupTypes={groupTypes}
                productLines={productLines}
                measurementUnits={measurementUnits}
                productReference={selectedProduct} 
                onClose={goBack} 
              />
            )
          }
          editView={
            (
              <ProductEditForm 
                brands={brands}
                groupTypes={groupTypes}
                measurementUnits={measurementUnits}
                productLines={productLines}
                productReference={selectedProduct} 
                onClose={goBack} 
              />
            )
          }
        />
      )}

      {/* Export PDF Modal */}
      <ExportPdfModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportPDF}
        brands={brands}
        productLines={productLines}
        measurementUnits={measurementUnits}
        priceLevels={priceLevels}
        isExporting={isExporting}
      />
    </MainLayout>
  );
};

const colors = [
  { label: "Rojo", value: "red" },
  { label: "Verde", value: "green" },
  { label: "Azul", value: "blue" },
];

export default InventoryPage;