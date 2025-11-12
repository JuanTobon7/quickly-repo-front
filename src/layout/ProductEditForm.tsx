import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, ImagePlus, ScanLine, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Product } from '@/services/api/products';
import { useProducts } from '@/hooks/inventory/useProduct';
import { GroupType } from '@/services/api/groupType';
import { ProductLine } from '@/services/api/productLines';
import { GenericDropdown } from '@/components/ui/DropDown';
import { Brand } from '@/services/api/brands';
import { Measurement } from '@/services/api/measurementUnits';
import { usePriceScales } from '@/hooks/inventory/usePriceScales';
import { PriceScale } from '@/services/api/priceScales';
import { useSystemMetadata } from '@/hooks/inventory/useSystemMetadata';
import { BarcodeScanner } from '@/components/products/BarcodeScannerInput';
import { startProductFormTour } from '@/config/productFormTour';
import { checkImageServiceHealth, processImage, createImagePreviewUrl, revokeImagePreviewUrl } from '@/services/api/images';
import ImageProcessModal from '@/components/products/ImageProcessModal';

type ProductEditFormProps = {
  productReference?: Product;
  groupTypes: GroupType[];
  productLines: ProductLine[];
  measurementUnits: Measurement[];
  brands: Brand[];
  onClose: () => void;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};


const ProductEditForm = ({ productReference,groupTypes,productLines,measurementUnits,brands, onClose }: ProductEditFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImageBlob, setProcessedImageBlob] = useState<Blob | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageServiceAvailable, setImageServiceAvailable] = useState<boolean | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [processedPreview, setProcessedPreview] = useState<string>('');
  const [product, setProduct] = useState<Product>(productReference|| {
    id: '',
    barCode: '',
    code: "",
    name: '',
    description: '',
    productLine: { id: '', name: '' },
    brand: { id: '', name: '' },
    measurement: { id: '', name: '' },
    reference: '',
    roundingEnabled: false,
    cost: 0,
  });
  const {setProduct: saveProduct, createMutation, updateMutation} = useProducts({});
  const { priceScales, isLoading: loadingPriceScales, createPriceScale, globalScale, updatePriceScale } = usePriceScales();
  const { systemMetadata, isLoading: loadingSystemMetadata } = useSystemMetadata();
  const [selectedLine, setSelectedLine] = useState<string | undefined>(productReference?.productLine?.id);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(productReference?.brand?.id);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>();
  const [selectedMeasurementUnit, setSelectedMeasurementUnit] = useState<string | undefined>(productReference?.measurement?.id);
  const [cost, setCost] = useState<number>(productReference?.cost || 0);
  const [roundingEnabled, setRoundingEnabled] = useState<boolean>(productReference?.roundingEnabled || false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  // Estado para niveles de precio editables
  type PriceLevel = {
    position: number;
    name: string;
    profitPercentage: number;
    salePrice: number;
  };
  
  const [editableLevels, setEditableLevels] = useState<PriceLevel[]>([
    { position: 1, name: 'Mayorista', profitPercentage: 100, salePrice: 0 },
    { position: 2, name: 'Minorista', profitPercentage: 90, salePrice: 0 },
    { position: 3, name: 'Distribuidor', profitPercentage: 40, salePrice: 0 },
    { position: 4, name: 'Especial', profitPercentage: 30, salePrice: 0 },
    { position: 5, name: 'VIP', profitPercentage: 20, salePrice: 0 },
    { position: 6, name: 'Empleado', profitPercentage: 10, salePrice: 0 },
  ]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`El archivo supera el límite de 10 MB. Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Formato no soportado. Use JPEG, PNG o WEBP`);
      return;
    }

    // Create preview of original
    const originalUrl = URL.createObjectURL(file);
    setOriginalFile(file);
    setOriginalPreview(originalUrl);

    // Check if service is available
    setIsProcessingImage(true);
    try {
      const health = await checkImageServiceHealth();
      
      if (!health.success || health.data.status === 'unavailable') {
        toast.warning('Servicio de procesamiento no disponible. Usando imagen original.');
        setImagePreview(originalUrl);
        setIsProcessingImage(false);
        return;
      }

      // Process image
      toast.info('Procesando imagen...');
      const processedBlob = await processImage(file, {
        maxWidth: 1200,
        quality: 85,
        removeBackground: true,
        addWhiteBackground: true,
      });

      const processedUrl = createImagePreviewUrl(processedBlob);
      setProcessedPreview(processedUrl);
      setProcessedImageBlob(processedBlob);
      
      // Show modal to compare
      setShowImageModal(true);
      setIsProcessingImage(false);
      
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Error al procesar la imagen');
      // Use original on error
      setImagePreview(originalUrl);
      setIsProcessingImage(false);
    }
  };

  const handleAcceptProcessedImage = (blob: Blob, url: string) => {
    setImagePreview(url);
    setProcessedImageBlob(blob);
    setShowImageModal(false);
    toast.success('Imagen procesada aplicada correctamente');
    
    // Clean up original preview
    if (originalPreview) {
      revokeImagePreviewUrl(originalPreview);
    }
  };

  const handleCancelImageProcess = () => {
    setShowImageModal(false);
    // Clean up URLs
    if (originalPreview) revokeImagePreviewUrl(originalPreview);
    if (processedPreview) revokeImagePreviewUrl(processedPreview);
    setOriginalFile(null);
    setProcessedImageBlob(null);
    toast.info('Procesamiento de imagen cancelado');
  };

  const handleSelectNewImage = () => {
    setShowImageModal(false);
    // Clean up URLs
    if (originalPreview) revokeImagePreviewUrl(originalPreview);
    if (processedPreview) revokeImagePreviewUrl(processedPreview);
    setOriginalFile(null);
    setProcessedImageBlob(null);
    // Trigger file input click
    document.querySelector<HTMLInputElement>('input[type="file"][accept="image/*"]')?.click();
  };

  // Check image service health on mount
  useEffect(() => {
    const checkService = async () => {
      try {
        const health = await checkImageServiceHealth();
        setImageServiceAvailable(health.success && health.data.status === 'available');
      } catch {
        setImageServiceAvailable(false);
      }
    };
    checkService();
  }, []);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        revokeImagePreviewUrl(imagePreview);
      }
      if (originalPreview) revokeImagePreviewUrl(originalPreview);
      if (processedPreview) revokeImagePreviewUrl(processedPreview);
    };
  }, []);
  
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
  const roundPrice = (price: number, roundingValue: number): number => {
    return Math.ceil(price / roundingValue) * roundingValue;
  };

  // Calcular precio de venta basado en costo y porcentaje de utilidad
  const calculateSalePrice = (cost: number, profitPercentage: number): number => {
    if (!cost || cost <= 0) return 0;
    
    const profit = (cost * profitPercentage) / 100;
    let price = cost + profit;

    // Aplicar utilidad mínima si está configurada
    if (systemMetadata?.minimumProfitPercentage) {
      const minProfit = (cost * systemMetadata.minimumProfitPercentage) / 100;
      const minPrice = cost + minProfit;
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

  // Recalcular todos los niveles cuando cambia el costo, systemMetadata o roundingEnabled
  useEffect(() => {
    if (cost > 0) {
      const updatedLevels = editableLevels.map(level => {
        const salePrice = calculateSalePrice(cost, level.profitPercentage);
        return {
          ...level,
          salePrice,
        };
      });
      setEditableLevels(updatedLevels);
    }
  }, [cost, systemMetadata, roundingEnabled]);

  // Actualizar un nivel específico cuando cambia el porcentaje de utilidad
  const updateLevelProfitPercentage = (position: number, profitPercentage: number) => {
    const updatedLevels = editableLevels.map(level => {
      if (level.position === position) {
        const salePrice = calculateSalePrice(cost, profitPercentage);
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

  // Actualizar el nombre de un nivel
  const updateLevelName = (position: number, name: string) => {
    const updatedLevels = editableLevels.map(level => {
      if (level.position === position) {
        return {
          ...level,
          name,
        };
      }
      return level;
    });
    setEditableLevels(updatedLevels);
  };

  // Cargar la escala global automáticamente al montar el componente
  useEffect(() => {
    if (globalScale && editableLevels.length === 0) {
      const loadedLevels = globalScale.levels
        .sort((a, b) => a.position - b.position)
        .map(level => {
          const salePrice = calculateSalePrice(cost, level.profitPercentage);
          return {
            position: level.position,
            name: level.name,
            profitPercentage: level.profitPercentage,
            salePrice,
          };
        });
      setEditableLevels(loadedLevels);
      toast.success(`Escala global cargada: ${globalScale.name}`);
    }
  }, [globalScale, cost]);

  const handleSave = () => {
    console.log('Guardando producto:', product);

    if (!product) return;

    if (!selectedLine || !selectedBrand || !selectedMeasurementUnit) {
      toast.error("Debe seleccionar línea, marca y unidad de medida");
      return;
    }

    const payload = {
      id: product?.id || undefined,
      barCode: product.barCode,
      name: product.name,
      productLineId: selectedLine,
      brandId: selectedBrand,
      reference: product.reference,
      description: product.description,
      measurementId: selectedMeasurementUnit,
      priceScaleId: globalScale?.id, // Usar siempre la escala global
      roundingEnabled: roundingEnabled,
      cost: cost,
    };

    saveProduct(payload);
  };

  // Actualizar la escala global con los niveles editados
  const handleSavePriceScale = async () => {
    if (!globalScale) {
      toast.error('No se pudo cargar la escala global');
      return;
    }

    try {
      await updatePriceScale(globalScale.id, {
        name: globalScale.name, // Mantener el nombre existente
        active: true,
        levels: editableLevels.map(level => ({
          position: level.position,
          name: level.name,
          profitPercentage: level.profitPercentage,
        })),
      });
      toast.success('Escala de precio actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la escala de precio');
      console.error(error);
    }
  };

  // Mostrar mensaje de éxito cuando se guarde el producto
  useEffect(() => {
    if (createMutation.isSuccess) {
      toast.success("Producto creado correctamente");
    }
    if (updateMutation.isSuccess) {
      toast.success("Producto actualizado correctamente");
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess]);

  useEffect(()=>{
    if (productReference) {
      setProduct(productReference);
      setSelectedLine(productReference.productLine?.id);
      setSelectedBrand(productReference.brand?.id);
      setSelectedMeasurementUnit(productReference.measurement?.id);
      setCost(productReference.cost || 0);
      setRoundingEnabled(productReference.roundingEnabled || false);
      
      // Cargar niveles de precio si existen
      if (productReference.priceScale?.levels) {
        const loadedLevels = productReference.priceScale.levels
          .sort((a, b) => a.position - b.position)
          .map(level => {
            const salePrice = calculateSalePrice(productReference.cost || 0, level.profitPercentage);
            return {
              position: level.position,
              name: level.name,
              profitPercentage: level.profitPercentage,
              salePrice,
            };
          });
        setEditableLevels(loadedLevels);
      }
    }
  },[productReference])

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
                  defaultValue={product?.name}
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

              {/* Imagen */}
              <div className="product-image-section flex justify-center mt-4">
                <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-white">
                  {isProcessingImage ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      <Loader2 className="mb-2 h-12 w-12 animate-spin text-primary" />
                      <p className="text-xs text-muted">Procesando imagen...</p>
                    </div>
                  ) : imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <ImagePlus className="mb-2 h-12 w-12 text-muted/40" />
                      <p className="text-xs text-muted">Subir imagen</p>
                      {imageServiceAvailable === false && (
                        <p className="mt-2 text-xs text-amber-600">⚠ Servicio no disponible</p>
                      )}
                      {imageServiceAvailable === true && (
                        <p className="mt-2 text-xs text-green-600">✓ Procesamiento activo</p>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isProcessingImage}
                    className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />
                  <button className="absolute right-2 top-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-md">
                    Nuevo
                  </button>
                </div>
              </div>

              {/* Precios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="product-cost">
                  <label className="mb-1 block text-xs font-medium text-secondary">Costo unitario (Con IVA):</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-red-600"
                  />
                </div>
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
            <h3 className="text-sm font-semibold text-secondary">Escala de Precio Global</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleSavePriceScale}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Guardar Escala
              </button>
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
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e) => updateLevelName(level.position, e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        placeholder="Nombre del nivel"
                      />
                    </TableCell>
                    <TableCell className="price-profit-percentage">
                      <input
                        type="number"
                        value={level.profitPercentage}
                        onChange={(e) => updateLevelProfitPercentage(level.position, parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                        step="0.01"
                        min="0"
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

      {/* Image Process Modal */}
      {showImageModal && originalFile && processedImageBlob && (
        <ImageProcessModal
          originalFile={originalFile}
          originalPreview={originalPreview}
          processedBlob={processedImageBlob}
          processedPreview={processedPreview}
          onAccept={handleAcceptProcessedImage}
          onCancel={handleCancelImageProcess}
          onSelectNew={handleSelectNewImage}
        />
      )}

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

export default ProductEditForm;