import { useEffect, useState, useRef, memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, ScanLine, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getProductById, Product } from '@/services/api/products';
import { UpsertPayload, useProducts } from '@/hooks/inventory/useProduct';
import { GroupType } from '@/services/api/groupType';
import { ProductLine } from '@/services/api/productLines';
import { GenericDropdown } from '@/components/ui/DropDown';
import { Brand } from '@/services/api/brands';
import { Measurement } from '@/services/api/measurementUnits';
import { useSystemMetadata } from '@/hooks/inventory/useSystemMetadata';
import { usePriceScaleNames } from '@/hooks/inventory/usePriceScaleNames';
import { BarcodeScanner } from '@/components/products/BarcodeScannerInput';
import { startProductFormTour } from '@/config/productFormTour';
import { ProductTaxSection, PriceTaxData } from '@/components/products/ProductTaxSection';
import { formatCurrency } from '@/utils/currency';
import { PercentageInput } from '@/components/ui/PercentageInput';
import { ProductImageUploader, ProductImageUploaderRef } from '@/components/products/ProductImageUploader';
import { roundPrice } from '@/utils/fun';

type ProductEditFormProps = {
  productReferenceId?: string;
  groupTypes: GroupType[];
  productLines: ProductLine[];
  measurementUnits: Measurement[];
  brands: Brand[];
  onClose: () => void;
};


const ProductEditForm = ({ productReferenceId,groupTypes,productLines,measurementUnits,brands, onClose }: ProductEditFormProps) => {
  const imageUploaderRef = useRef<ProductImageUploaderRef>(null);
  
  const [product, setProduct] = useState<Product>(null);
  const {saveProduct} = useProducts({});
  const { systemMetadata, isLoading: loadingSystemMetadata } = useSystemMetadata();
  const { activePriceScaleNames } = usePriceScaleNames();
  const [selectedLine, setSelectedLine] = useState<string | undefined>(product?.productLine?.id);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(product?.brand?.id);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(product?.groupTypeProduct?.id);
  const [selectedMeasurementUnit, setSelectedMeasurementUnit] = useState<string | undefined>(product?.measurement?.id);
  const [cost, setCost] = useState<number>(product?.cost);
  const [roundingEnabled, setRoundingEnabled] = useState<boolean>(product?.roundingEnabled || false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [taxData, setTaxData] = useState<PriceTaxData>(null);
  // Estado para niveles de precio editables
  type PriceLevel = {
    priceScaleNameId: string;
    position: number;
    name: string;
    profitPercentage: number;
    salePrice: number;
  };

  const [editableLevels, setEditableLevels] = useState<PriceLevel[]>([]);

  // Memoizar callback de taxData para evitar re-renders de ProductTaxSection
  const handleTaxDataChange = useCallback((data: PriceTaxData) => {
    setTaxData(data);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      const result = await getProductById(productReferenceId)
      setProduct(result)
    }

    fetchProduct()
  }, [productReferenceId])

  useEffect(() => {
    if (!product || !product.id) return;

    setTaxData({
      basePrice: product.cost,
      priceIncludesTax: !!product.taxes,
      selectedTax: product.taxes || null,
      priceBeforeTaxes: product?.priceBeforeTaxes,
      priceAfterTaxes: product?.priceAfterTaxes,
    });
  }, [product]);


  const handleChange = (key: keyof Product, value: any) => {
    setProduct((prev) => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
  };

  
  const handleScan = (code: string) => {
    handleChange('barCode', code)
    setIsScanning(false)         
  }

  // Función de redondeo basada en el valor configurado
  // Calcular precio de venta basado en costo y porcentaje de utilidad
  const calculateSalePrice = (baseCost: number, profitPercentage: number): number => {
    if(!product) return;
    // Usar priceAfterTaxes si está disponible, de lo contrario usar cost
    const costToUse = taxData?.priceAfterTaxes > 0 ? taxData?.priceAfterTaxes : baseCost;
    
    if (!costToUse || costToUse <= 0) return 0;
    
    const profit = (costToUse * profitPercentage) / 100;
    let price = costToUse + profit;

    // Aplicar utilidad mínima si está configurada
    if (systemMetadata?.minimumProfitPercentage) {
      const minProfit = (costToUse * systemMetadata.minimumProfitPercentage) / 100;
      const minPrice = costToUse + minProfit;
      if (price < minPrice) {
        price = minPrice;
      }
    }

    // Aplicar redondeo si está habilitado
    if (roundingEnabled && systemMetadata?.roundingEnabled && systemMetadata?.roundingValue) {
      price = roundPrice(price, systemMetadata.roundingValue);
    }

    return price;
  };

  // Inicializar niveles desde nombres activos cuando están disponibles
  useEffect(() => {
    if(!product) return;
    if (activePriceScaleNames && activePriceScaleNames.length > 0 && editableLevels.length === 0) {
      const initialLevels = activePriceScaleNames.map(scaleName => ({
        priceScaleNameId: scaleName.id,
        position: scaleName.position,
        name: scaleName.name,
        profitPercentage: 0,
        salePrice: 0,
      }));
      setEditableLevels(initialLevels);
    }
  }, [activePriceScaleNames, product]);

  // Recalcular todos los niveles cuando cambia el costo, systemMetadata, roundingEnabled o taxData
  useEffect(() => {
    if(!product) return;
    const baseCost = taxData?.priceAfterTaxes > 0 ? taxData?.priceAfterTaxes : cost;
    if (baseCost > 0 && editableLevels.length > 0) {
      const updatedLevels = editableLevels.map(level => {
        const salePrice = calculateSalePrice(baseCost, level.profitPercentage);
        return {
          ...level,
          salePrice,
        };
      });
      setEditableLevels(updatedLevels);
    }
  }, [cost, systemMetadata, roundingEnabled, taxData?.priceAfterTaxes, product]);

  // Sincronizar cost con taxData.basePrice cuando el usuario edita los impuestos
  useEffect(() => {
    if(!product) return;
    if (taxData.basePrice > 0 && taxData.basePrice !== cost) {
      setCost(taxData.basePrice);
    }
  }, [taxData?.basePrice, product]);

  // Actualizar un nivel específico cuando cambia el porcentaje de utilidad
  const updateLevelProfitPercentage = (position: number, profitPercentage: number) => {
    if(!product) return;
    const baseCost = taxData.priceAfterTaxes > 0 ? taxData.priceAfterTaxes : cost;
    const updatedLevels = editableLevels.map(level => {
      if (level.position === position) {
        const salePrice = calculateSalePrice(baseCost, profitPercentage);
        return {
          ...level,
          profitPercentage,
          salePrice,
        };
      }
      return level;
    });
    setEditableLevels(updatedLevels);
  };

  const handleSave = async () => {
    if (!product) return;

    if (!selectedLine || !selectedBrand || !selectedMeasurementUnit || !selectedGroup) {
      toast.error("Debe seleccionar línea, marca, unidad de medida y grupo");
      return;
    }
    try {
      const payload: UpsertPayload = {
        id: product.id || undefined,
        barCode: product.barCode,
        name: product.name,
        productLineId: selectedLine,
        brandId: selectedBrand,
        reference: product.reference,
        description: product.description,
        measurementId: selectedMeasurementUnit,
        groupId: selectedGroup,
        priceLevels: editableLevels.map(level => ({
          priceScaleNameId: level.priceScaleNameId,
          profitPercentage: level.profitPercentage,
        })),
        roundingEnabled,
        cost,
        priceBeforeTaxes: taxData.priceBeforeTaxes || undefined,
        priceAfterTaxes: taxData.priceAfterTaxes || undefined,
        taxId: taxData.selectedTax?.id || undefined,
      };

      // ⚡ Guardar producto primero
      const saved = await saveProduct(payload);
      setProduct(saved);

      // ⚡ Subir imágenes pendientes al servidor usando el componente
      if (imageUploaderRef.current && saved.id) {
        const success = await imageUploaderRef.current.uploadPendingImages();
        if (success) {
          toast.success('Producto e imágenes guardados exitosamente');
        } else {
          toast.warning('Producto guardado pero hubo problemas con algunas imágenes');
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
    }
  };

  useEffect(()=>{
    if (!product) return;
    setProduct(product);
    setSelectedLine(product.productLine?.id);
    setSelectedBrand(product.brand?.id);
    setSelectedMeasurementUnit(product.measurement?.id);
    setSelectedGroup(product.groupTypeProduct?.id);
    setCost(product?.cost || 0);
    setRoundingEnabled(product.roundingEnabled || false);
    
    // Cargar datos de impuestos (siempre inicializar taxData)
    setTaxData({
      basePrice: product?.cost || 0,
      priceIncludesTax: false,
      selectedTax: product.taxes || null,
      priceBeforeTaxes: product.priceBeforeTaxes || 0,
      priceAfterTaxes: product.priceAfterTaxes || 0,
    });
    
    // Cargar niveles de precio si existen
    if (product.priceLevels && product.priceLevels.length > 0) {
      const baseCost = product.priceAfterTaxes || product?.cost || 0;
      const loadedLevels = product.priceLevels
        .sort((a, b) => a.position - b.position)
        .map(level => {
          const salePrice = calculateSalePrice(baseCost, level.profitPercentage);
          return {
            priceScaleNameId: level.priceScaleNameId || '',
            position: level.position,
            name: level.name,
            profitPercentage: level.profitPercentage,
            salePrice,
          };
        });
      setEditableLevels(loadedLevels);
    }
      
      // Intentar cargar imágenes pendientes desde localStorage
      if (product.id) {
        const storageKey = `product_images_${product.id}`;
        const storedImages = localStorage.getItem(storageKey);
        if (storedImages) {
          try {
            const parsedImages = JSON.parse(storedImages);
           
          } catch (error) {
            console.error('Error parsing stored images:', error);
          }
        }
      }
  },[product])

  return (
    <section className="h-auto w-full space-y-8 pb-9 ">
      <div className='border-border/60 bg-white shadow-soft rounded-3xl border  p-9'>
        <header className="product-form-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel-product rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-gray-50"
            >
              Volver al catálogo
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-save-product rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary/90"
            >
              Guardar cambios
            </button>
          </div>

          <button
            type="button"
            onClick={startProductFormTour}
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:shadow-md self-start md:self-auto"
            title="Iniciar tutorial"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Ayuda</span>
          </button>
        </header>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              {/* Código */}
              <div className="product-code flex flex-wrap items-center gap-2">
                <label className="w-full sm:w-32 text-sm font-medium text-secondary">Código:</label>
                <div className="flex flex-1 max-w-full items-center gap-2">
                  <button className="rounded-md border border-border bg-white px-3 py-2 text-secondary hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    disabled={!product}
                    defaultValue={product?.code}
                    onChange={(e)=> handleChange('code', e.target.value)}
                    className={`flex-1 rounded-lg border border-border w-full px-3 py-2 text-center text-sm font-semibold ${product ? 'bg-reed-50 text-black' : 'bg-gray-100 text-muted'}`}
                  />
                  <button className="rounded-md border border-border bg-white px-3 py-2 text-secondary hover:bg-gray-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Referencia */}
              <div className="product-reference flex flex-wrap items-center gap-2">
                <label className="w-full sm:w-32 text-sm font-medium text-secondary">Referencia:</label>
                <input
                  type="text"
                  defaultValue={product?.reference}
                  onChange={(e)=> handleChange('reference', e.target.value)}
                  className="flex-1 min-w-[120px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </div>

              {/* Nombre del producto */}
              <div className="product-name flex flex-wrap items-start gap-2">
                <label className="w-full sm:w-32 pt-2 text-sm font-medium text-secondary">Nombre del producto:</label>
                <input
                  type="text"
                  value={product?.name ?? ""}
                  onChange={(e)=> handleChange('name', e.target.value)}
                  className="flex-1 min-w-[120px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </div>

              {/* Descripción */}
              <div className="product-description flex flex-wrap items-start gap-2">
                <label className="w-full sm:w-32 pt-2 text-sm font-medium text-secondary">Descripción:</label>
                <textarea
                  defaultValue={product?.description}
                  onChange={(e)=> handleChange('description', e.target.value)}
                  rows={3}
                  className="flex-1 min-w-[120px] rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </div>

              {/* Dropdowns */}
              <div className="product-group flex flex-wrap items-center gap-2">
                <label className="w-full sm:w-36 text-sm font-medium text-secondary">Grupo:</label>
                <div className="flex-1 min-w-[120px]">
                  <GenericDropdown
                    label=""
                    options={groupTypes.map((o: any) => ({ label: o.name, value: o.id }))}
                    value={selectedGroup}
                    onChange={(val) => {
                      setSelectedGroup(val);
                      const selected = groupTypes.find((o: any) => o.id === val);
                      toast.success(`Grupo seleccionado: ${selected?.name}`);
                    }}
                    placeholder="Selecciona grupo"
                  />
                </div>
              </div>

              <div className="product-line flex flex-wrap items-center gap-2">
                <label className="w-full sm:w-36 text-sm font-medium text-secondary">Línea:</label>
                <div className="flex-1 min-w-[120px]">
                  <GenericDropdown
                    label=""
                    options={productLines.map((o: any) => ({ label: o.name, value: o.id }))}
                    value={selectedLine}
                    onChange={(val) => {
                      setSelectedLine(val);
                      const selected = productLines.find((o: any) => o.id === val);
                      toast.success(`Línea seleccionado: ${selected?.name}`);
                    }}
                    placeholder="Selecciona línea"
                  />
                </div>
              </div>

              <div className="product-measurement flex flex-wrap items-center gap-2">
                <label className="w-full sm:w-36 text-sm font-medium text-secondary">Unidad de Medida:</label>
                <div className="flex-1 min-w-[120px]">
                  <GenericDropdown
                    label=""
                    options={measurementUnits.map((o: any) => ({ label: o.name, value: o.id }))}
                    value={selectedMeasurementUnit}
                    onChange={(val) => {
                      setSelectedMeasurementUnit(val);
                      const selected = measurementUnits.find((o: any) => o.id === val);
                      toast.success(`Unidad de Medida seleccionado: ${selected?.name}`);
                    }}
                    placeholder="Selecciona unidad de medida"
                  />
                </div>
              </div>

              <div className="product-brand flex flex-wrap items-center gap-2">
                <label className="w-full sm:w-36 text-sm font-medium text-secondary">Marca:</label>
                <div className="flex-1 min-w-[120px]">
                  <GenericDropdown
                    label=""
                    options={brands.map((o: any) => ({ label: o.name, value: o.id }))}
                    value={selectedBrand}
                    onChange={(val) => {
                      setSelectedBrand(val);
                      const selected = brands.find((o: any) => o.id === val);
                      toast.success(`Marca seleccionado: ${selected?.name}`);
                    }}
                    placeholder="Selecciona marca"
                  />
                </div>
              </div>

              {/* Tax Configuration Section */}
              <div className="product-tax-section mt-4">
                <ProductTaxSection
                  key={product?.id || 'new-product'}
                  initialBasePrice={taxData?.basePrice || cost}
                  initialPriceIncludesTax={taxData?.priceIncludesTax}
                  initialSelectedTax={taxData?.selectedTax}
                  onChange={handleTaxDataChange}
                />

              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              {/* Buscar */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="w-full sm:w-32 text-sm font-medium text-secondary">Buscar:</label>
                <div className="flex flex-1 min-w-[120px] items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-lg border border-border bg-red-100 px-3 py-2 text-sm"
                  />
                  <button className="rounded-lg bg-red-100 p-2 hover:bg-red-200">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Código de Barras */}
              <div className="product-barcode flex flex-wrap items-center gap-2">
                <label className="w-full sm:w-32 text-sm font-medium text-secondary">Código de Barras:</label>
                <div className="relative flex-1 min-w-[120px]">
                  <input
                    type="text"
                    value={product?.barCode || ''}
                    onChange={(e) => handleChange('barCode', e.target.value)}
                    placeholder="Escanear o escribir código"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 pr-10 text-sm"
                  />
                  <ScanLine
                    onClick={() => setIsScanning(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted hover:text-primary transition"
                    strokeWidth={1.75}
                    size={18}
                  />
              </div>
            </div>

              {/* Imagen - Carrusel */}
              <div className="product-image-section">
                <ProductImageUploader 
                  productId={product?.id}
                  ref={imageUploaderRef}
                />
              </div>              {/* Redondeo checkbox */}
              <div className="product-rounding-checkbox">
                <label className="mb-1 block text-xs font-medium text-secondary">Redondear precio:</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={roundingEnabled}
                    onChange={(e) => setRoundingEnabled(e.target.checked)}
                    className="h-5 w-5 rounded border-border"
                    disabled={loadingSystemMetadata || !systemMetadata?.roundingEnabled}
                  />
                  {loadingSystemMetadata ? (
                    <span className="text-xs text-muted">Cargando configuración...</span>
                  ) : systemMetadata?.roundingEnabled && systemMetadata?.roundingValue ? (
                    <span className="text-xs text-green-600">✓ Redondeo a ${systemMetadata.roundingValue}</span>
                  ) : (
                    <span className="text-xs text-amber-600">⚠ Deshabilitado en parámetros</span>
                  )}
                </div>
              </div>

              {/* Utilidad mínima */}
              {systemMetadata?.minimumProfitPercentage && (
                <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2">
                  <p className="text-xs text-blue-700">
                    ℹ️ Utilidad mínima configurada: {systemMetadata.minimumProfitPercentage}%
                  </p>
                </div>
              )}
            </div>
          </div>
        {/* Tabla de Escalas de Precio */}
        <div className="price-scale-table mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-secondary">Niveles de Precio del Producto</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditableLevels(prevLevels => 
                    prevLevels.map(level => ({
                      ...level,
                      profitPercentage: 0,
                      salePrice: 0,
                    }))
                  );
                  toast.info('Precios limpiados');
                }}
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
                {editableLevels.map((level) => (
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
                        onChange={(value) => updateLevelProfitPercentage(level.position, value)}
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
      </div>

      {isScanning && (
        <BarcodeScanner
          isScanning={isScanning}
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}
    </section>
  );
};

export default memo(ProductEditForm);