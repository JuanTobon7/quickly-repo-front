import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, User, DollarSign, FileText, CreditCard, Receipt, X, Plus, Minus, Printer, Users, LockKeyhole, FileSpreadsheet, PenLine, BookOpen, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/inventory/useProduct';
import { getProductById, type Product, type ProductQueryParams, type ProductSummary } from '@/services/api/products';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/ui/DataTable';
import { PageableRequest } from '@/services/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import ProductConfirmModal from '@/components/products/ProductConfirmModal';
import { useKeyboardLevel } from '@/hooks/useKeyBoard';
import { startPosPageTour } from '@/config/posTour';

type InvoiceItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

function InvoiceItemRow({ item, handleUpdateQuantity, isFocused = false }) {
  const [editValue, setEditValue] = useState(item.quantity);

  useEffect(() => {
    setEditValue(item.quantity);
  }, [item.quantity]);

  return (
    <div className={`flex items-center gap-2 ${isFocused ? 'bg-blue-100 rounded p-1' : ''}`}>
      <button
        onClick={() => handleUpdateQuantity(item.product.id, -1)}
        className="p-1 hover:bg-red-100 rounded transition"
      >
        -
      </button>

      <input
        type="number"
        className="font-bold text-secondary w-12 text-center text-sm border rounded
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
          [-moz-appearance:textfield]"
        value={editValue}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "" || /^[0-9]+$/.test(val)) {
            setEditValue(val);
          }
        }}
        onBlur={() => {
          const parsed = parseInt(editValue, 10);

          if (isNaN(parsed)) {
            setEditValue(item.quantity);
            return;
          }

          const delta = parsed - item.quantity;
          if (delta !== 0) {
            handleUpdateQuantity(item.product.id, delta);
          }

          setEditValue(parsed);
        }}
        min={1}
      />

      <button
        onClick={() => handleUpdateQuantity(item.product.id, 1)}
        className="p-1 hover:bg-green-100 rounded transition"
      >
        +
      </button>
    </div>
  );
}

const pageSizeOptions: number[] = [20];

const PosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [pageableRequest, setPageableRequest] = useState<PageableRequest>();
  const [temporalProduct, setTemporalProduct] = useState<Product>(null);
  const [temporalSummary, setTemporalSummary] = useState<ProductSummary>(null);
  const [ctrlModalProduct, setCtrlModalProduct] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState({
    name: 'JULIAN GUILLEN CUBILLOS',
    nit: '93297332',
    seller: 'YEISON OSORIO'
  });
  
  // Nuevo estado para el índice del item enfocado
  const [focusedInvoiceIndex, setFocusedInvoiceIndex] = useState<number>(0);
  // Estado para el buffer de entrada numérica
  const [numberBuffer, setNumberBuffer] = useState<string>('');
  
  const debouncedSearchInput = useDebounce(searchTerm, 300);
  const [params, setParams] = useState<ProductQueryParams>({
    pageableRequest: pageableRequest,
    keyWord: debouncedSearchInput
  });

  const { products, isLoading, totalPages, totalElements, currentPage } = useProducts(params);
  const [productsBank, setProductsBank] = useState<ProductSummary[]>([]);

  // Modificamos el hook useKeyboardLevel para manejar el nivel "search"
  const { level, setLevel } = useKeyboardLevel("datatable");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const invoiceContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParams({
      pageableRequest: pageableRequest,
      keyWord: debouncedSearchInput
    });
  }, [pageableRequest, debouncedSearchInput]);

  useEffect(() => {
    if (products.length > 0) {
      setProductsBank(products);
    }
  }, [products]);

  // Efecto para manejar el foco automático cuando cambiamos al nivel "search"
  useEffect(() => {
    if (level === "search" && searchRef.current) {
      searchRef.current.focus();
      searchRef.current.select(); // Selecciona todo el texto para facilitar reemplazo
    }
  }, [level]);

  // Efecto para limpiar el buffer numérico cuando cambia el foco
  useEffect(() => {
    if (level !== "parent") {
      setNumberBuffer('');
    }
  }, [level, focusedInvoiceIndex]);

  // Función para procesar entrada numérica
  const processNumberInput = (key: string) => {
    if (level === "parent" && invoiceItems.length > 0 && focusedInvoiceIndex >= 0) {
      const currentItem = invoiceItems[focusedInvoiceIndex];
      if (!currentItem) return;

      let newBuffer = numberBuffer + key;
      
      // Limitar a 4 dígitos máximo
      if (newBuffer.length > 4) {
        newBuffer = newBuffer.slice(-4);
      }

      setNumberBuffer(newBuffer);

      // Si el buffer tiene al menos 1 dígito, actualizar la cantidad
      if (newBuffer.length >= 1) {
        const newQuantity = parseInt(newBuffer, 10);
        if (!isNaN(newQuantity) && newQuantity > 0) {
          const delta = newQuantity - currentItem.quantity;
          if (delta !== 0) {
            handleUpdateQuantity(currentItem.product.id, delta);
          }
        }
      }
    }
  };

  // Efecto para manejar navegación con teclado en invoiceItems
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ctrl + Enter - toggle modo búsqueda
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        if (level === "search") {
          // Si ya estamos en modo búsqueda, volver al datatable
          setLevel("datatable");
        } else {
          // Si no estamos en modo búsqueda, activarlo
          setLevel("search");
        }
      }
      
      // Navegación entre secciones
      if (e.key === "ArrowLeft" && e.ctrlKey) {
        e.preventDefault();
        setLevel("datatable");
        setFocusedInvoiceIndex(-1);
      }
      if (e.key === "ArrowRight" && e.ctrlKey) {
        e.preventDefault();
        setLevel("parent");
        setFocusedInvoiceIndex(0);
      }

      // Si estamos en modo búsqueda, no procesar otras teclas de navegación
      if (level === "search") {
        // Permitir Escape para salir del modo búsqueda
        if (e.key === "Escape") {
          e.preventDefault();
          setLevel("datatable");
        }
        return;
      }

      // Solo procesar teclas si estamos en nivel parent y hay items
      if (level === "parent" && invoiceItems.length > 0) {
        // Teclas numéricas (0-9) para actualización directa
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          processNumberInput(e.key);
          return;
        }

        // Backspace para borrar el buffer
        if (e.key === "Backspace") {
          e.preventDefault();
          if (numberBuffer.length > 0) {
            const newBuffer = numberBuffer.slice(0, -1);
            setNumberBuffer(newBuffer);
            
            if (newBuffer.length > 0) {
              const currentItem = invoiceItems[focusedInvoiceIndex];
              const newQuantity = parseInt(newBuffer, 10);
              if (!isNaN(newQuantity) && newQuantity > 0) {
                const delta = newQuantity - currentItem.quantity;
                if (delta !== 0) {
                  handleUpdateQuantity(currentItem.product.id, delta);
                }
              }
            } else {
              // Si el buffer está vacío, volver a cantidad 1
              const currentItem = invoiceItems[focusedInvoiceIndex];
              const delta = 1 - currentItem.quantity;
              if (delta !== 0) {
                handleUpdateQuantity(currentItem.product.id, delta);
              }
            }
          }
          return;
        }

        // Escape para limpiar buffer
        if (e.key === "Escape") {
          e.preventDefault();
          setNumberBuffer('');
          return;
        }

        // Tecla + para incrementar
        if (e.key === "+" || e.key === "Add") {
          e.preventDefault();
          if (focusedInvoiceIndex >= 0 && focusedInvoiceIndex < invoiceItems.length) {
            handleUpdateQuantity(invoiceItems[focusedInvoiceIndex].product.id, 1);
          }
        }
        
        // Tecla - para decrementar
        if (e.key === "-" || e.key === "Subtract") {
          e.preventDefault();
          if (focusedInvoiceIndex >= 0 && focusedInvoiceIndex < invoiceItems.length) {
            handleUpdateQuantity(invoiceItems[focusedInvoiceIndex].product.id, -1);
          }
        }

        // Navegación con flechas arriba/abajo entre invoice items
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedInvoiceIndex(prev => 
            prev < invoiceItems.length - 1 ? prev + 1 : 0
          );
        }
        
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedInvoiceIndex(prev => 
            prev > 0 ? prev - 1 : invoiceItems.length - 1
          );
        }

        // Enter para facturar
        if (e.key === "Enter") {
          e.preventDefault();
          handleProcessInvoice();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [level, invoiceItems, focusedInvoiceIndex, numberBuffer]);

  // Manejar el blur del input de búsqueda para volver al datatable
  const handleSearchBlur = () => {
    if (level === "search") {
      // Pequeño delay para evitar conflictos con otros eventos
      setTimeout(() => {
        setLevel("datatable");
      }, 100);
    }
  };

  // Manejar click derecho para iniciar navegación
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (invoiceItems.length > 0 && level === "parent") {
      // Iniciar navegación desde el primer elemento
      setFocusedInvoiceIndex(0);
      toast.info(`Navegación activada. Producto ${invoiceItems[0].product.name} seleccionado. Use ↑/↓ para navegar, +/- para modificar cantidades y teclas numéricas para cantidades directas.`);
    }
  };

  // Calcular totals
  const invoiceTotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  }, [invoiceItems]);

  const openModal = async (productSummary: ProductSummary) => {
    const product = await getProductById(productSummary.id);
    setTemporalProduct(product);
    setCtrlModalProduct(true);
    setTemporalSummary(productSummary);
    setLevel("modal");
    setFocusedInvoiceIndex(0);
  };

  const closeModal = () => {
    setTemporalProduct(null);
    setCtrlModalProduct(false);
    setLevel("datatable") 
  };

  const handleAddProduct = (delta = 0, selectedPrice?: number) => {
    handleUpdateQuantity(temporalProduct.id, delta, selectedPrice);
    setTemporalProduct(null);
    setFocusedInvoiceIndex(0);
  };

  const handleUpdateQuantity = (productId: string, delta: number, selectedPrice?: number) => {
    const product = productsBank.find(p => p.id === productId);
    if (!product) return;

    const invoiceItem = invoiceItems.find(i => i.product.id === productId);
    const currentIndex = invoiceItems.findIndex(i => i.product.id === productId);

    // Si el item no existe → crearlo
    if (!invoiceItem) {
      if (delta <= 0) return;

      if (product.quantity < delta) {
        toast.error("Stock insuficiente");
        return;
      }

      const unitPrice = selectedPrice || temporalProduct.priceAfterTaxes;

      setInvoiceItems(prev => [
        ...prev,
        {
          product: temporalProduct,
          quantity: delta,
          unitPrice,
          total: delta * unitPrice
        }
      ]);
      
      setProductsBank(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - delta }
            : item
        )
      );
      
      // Enfocar el nuevo item agregado
      setFocusedInvoiceIndex(invoiceItems.length);
      toast.success('Producto Agregado');
      return;
    }

    // Si ya existe → actualizarlo
    const newQty = invoiceItem.quantity + delta;
    const newStock = product.quantity - delta;

    // Si la nueva cantidad es 0 → eliminar item
    if (newQty <= 0) {
      setProductsBank(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + invoiceItem.quantity }
            : item
        )
      );

      setInvoiceItems(prev =>
        prev.filter(i => i.product.id !== productId)
      );

      // Ajustar el índice enfocado después de eliminar
      if (focusedInvoiceIndex >= currentIndex) {
        setFocusedInvoiceIndex(prev => 
          prev > 0 ? prev - 1 : invoiceItems.length - 2 >= 0 ? 0 : -1
        );
      }
      return;
    }

    // Validar stock si delta es positivo
    if (delta > 0 && newStock < 0) {
      toast.error("Stock insuficiente");
      return;
    }

    // Actualizar stock
    setProductsBank(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newStock }
          : item
      )
    );

    // Actualizar item del invoice
    setInvoiceItems(prev =>
      prev.map(i =>
        i.product.id === productId
          ? {
              ...i,
              quantity: newQty,
              total: newQty * i.unitPrice
            }
          : i
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    const productInvoice = invoiceItems.find((item) => item.product.id == productId);
    const currentIndex = invoiceItems.findIndex(i => i.product.id === productId);
    
    handleUpdateQuantity(productInvoice.product.id, -productInvoice.quantity);
    setInvoiceItems(items => items.filter(item => item.product.id !== productId));
    
    // Ajustar el índice enfocado después de eliminar
    if (focusedInvoiceIndex >= currentIndex) {
      setFocusedInvoiceIndex(prev => 
        prev > 0 ? prev - 1 : invoiceItems.length - 2 >= 0 ? 0 : -1
      );
    }
    
    toast.info('Producto eliminado');
  };

  const handleClearInvoice = () => {
    setInvoiceItems([]);
    setFocusedInvoiceIndex(0);
    setNumberBuffer('');
    toast.info('Factura anulada');
  };

  const handleProcessInvoice = () => {
    if (invoiceItems.length === 0) {
      toast.error('Agregue productos a la factura');
      return;
    }
    toast.success('Procesando factura...');
  };

  const columns = useMemo<ColumnDef<ProductSummary>[]>(
    () => [
      {
        header: "Código",
        accessorKey: "code",
        cell: (info) => (
          <span className="font-medium text-secondary">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        header: "Imagen",
        accessorKey: "image",
        cell: (info) => (
          <img 
            src={info.getValue<string>() || 'https://elmayoristacolombia.com/tienda/imagenes/aceite.jpg'} 
            className='object-contain max-w-16'
          />
        ),
      },
      {
        header: "Referencia",
        accessorKey: "reference",
        cell: (info) => (
          <span className="text-secondary text-sm">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        header: "Nombre",
        accessorKey: "name",
        cell: (info) => (
          <span className="font-medium text-secondary">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        header: "Cantidad",
        accessorKey: "quantity",
        cell: (info) => (
          <span className="text-secondary font-mono">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        header: "Precio Venta",
        accessorKey: "priceSale",
        cell: (info) => (
          <span className="text-secondary">
            {formatCurrency(info.getValue<number>())}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-border/60 px-6 py-3 pos-page">
            <div className="flex items-center justify-between">
              <div className='flex items-end justify-between gap-4'>
                <div>                  
                  <p className="text-xs text-muted uppercase tracking-wide">EMPRESA AUTORIZADA: EL MAYORISTA SAS</p>
                  <h1 className="text-xl font-bold text-primary">Módulo: PUNTO DE VENTA</h1>
                </div>
                <button
                    type="button"
                    onClick={startPosPageTour}
                    className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:shadow-md self-start md:self-auto"
                    title="Iniciar tutorial"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Ayuda</span>
                  </button>
              </div>
              <div className="flex items-center gap-3">
                <a
                  className='group rounded-3xl border px-2 py-1 font-semibold transition flex items-center gap-2 border-transparent text-sm text-secondary hover:text-primary'
                  target="_blank"
                  href='https://docs-mayorista.vercel.app/'>
                  <BookOpen className='text-primary h-5 w-5'/>
                  Manual de Usuario
                </a>
                <div className="bg-gradient-to-br from-primary to-primary/90 text-white px-6 py-3 rounded-xl shadow-md">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    <div className="text-left">
                      <p className="text-xs font-medium opacity-90">CLIENTE</p>
                      <p className="font-bold text-sm">{selectedClient.name}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">NIT / CC: {selectedClient.nit}</p>
                  <p className="text-xs text-muted">ASESOR: <span className="font-semibold text-primary">{selectedClient.seller}</span></p>
                </div>
                <button className="p-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition">
                  <User className="h-6 w-6 text-primary" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex gap-4 p-4 overflow-hidden">
            <div className="w-[60%] flex flex-col gap-3 overflow-hidden">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition shadow-sm font-semibold text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  VER FACTURAS
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition shadow-sm font-semibold text-sm">
                  <LockKeyhole className="h-4 w-4" />
                  CIERRE DE CAJA
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md font-semibold text-sm">
                  <FileText className="h-4 w-4" />
                  FACTURA NUEVA
                </button>
              </div>

              <div className="relative search-element">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                <input
                  type="text"
                  ref={searchRef}
                  placeholder="Buscar productos por nombre, código o código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={handleSearchBlur}
                  className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-secondary placeholder:text-muted shadow-sm transition-all ${
                    level === "search" 
                      ? "border-primary ring-2 ring-primary/40 bg-blue-50" 
                      : "border-border/40 focus:ring-primary/40"
                  }`}
                />
                {level === "search" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-md font-semibold">
                      MODO BÚSQUEDA
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 py-2 bg-gray-50 border-b border-border/60 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-secondary">
                    Productos encontrados {totalElements}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      Mostrando pagina {currentPage + 1} de {totalPages} paginas
                    </span>
                    {level === "search" && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md font-semibold">
                        CTRL+ENTER para salir
                      </span>
                    )}
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="flex-1 p-2 h-full datatable-element">
                    <DataTable<ProductSummary>
                      columns={columns}
                      pageCount={totalPages}
                      variant='pos'
                      manualPagination={true}
                      pageFun={setPageableRequest}
                      pageSizeOptions={pageSizeOptions}
                      data={productsBank}
                      isLoading={isLoading}
                      level={level === "search" ? "search" : level} // Pasar el nivel actual al DataTable
                      onRowSelect={(row) => openModal(row)}
                      emptyState="No se encontraron productos con los filtros seleccionados."
                      isAvailableKeyBoard={level !== "search"} // Deshabilitar teclado en modo búsqueda
                    />
                  </div>
                )}

                <div className="px-4 py-2 bg-blue-50 border-t border-border/60">
                  <span className="text-sm text-primary font-semibold">FACTURA EN ESPERA</span>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md font-bold text-sm">
                  IMPRIMIR POS
                </button>
                <button className="flex-1 py-3 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition shadow-sm font-bold text-sm">
                  FACTURA PDF
                </button>
                <button className="flex-1 py-3 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition shadow-sm font-bold text-sm">
                  EDITAR FACTURA
                </button>
              </div>
            </div>

            {/* Sección derecha - Factura con navegación por click derecho */}
            <div 
              className="w-[40%] flex flex-col gap-3"
              ref={invoiceContainerRef}
              onContextMenu={handleContextMenu}
            >
              <div className="grid grid-cols-2 gap-2.5">
                <button className="flex flex-col items-center gap-2 p-3 bg-white border border-border text-secondary rounded-xl hover:border-primary/40 hover:text-primary transition shadow-sm">
                  <CreditCard className="h-6 w-6" />
                  <span className="text-xs font-bold">CRÉDITO</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition shadow-md">
                  <User className="h-6 w-6" />
                  <span className="text-xs font-bold">VER CLIENTE</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 bg-white border border-border text-secondary rounded-xl hover:border-primary/40 hover:text-primary transition shadow-sm">
                  <FileText className="h-6 w-6" />
                  <span className="text-xs font-bold">NOTA CRÉDITO</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition shadow-md">
                  <Receipt className="h-6 w-6" />
                  <span className="text-xs font-bold">REMISIÓN</span>
                </button>
              </div>

              {/* Invoice Items */}
              <div className="flex-1 bg-white rounded-xl border border-border/60 shadow-sm flex flex-col overflow-hidden invoice-element">
                <div className="px-3 py-2 bg-gray-50 border-b border-border/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-secondary">Factura</h3>
                    <p className="text-xs text-primary font-bold">FVE 100001</p>
                  </div>
                  <button
                    onClick={handleClearInvoice}
                    className="px-3 py-1.5 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition text-xs font-semibold"
                  >
                    ANULAR FACTURA
                  </button>
                </div>

                {/* Table Header */}
                <div className="bg-blue-500 text-white">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-bold">
                    <div className="col-span-2">COD</div>
                    <div className="col-span-4">PRODUCTO</div>
                    <div className="col-span-2 text-center">CANT</div>
                    <div className="col-span-2 text-right">V.UNID($)</div>
                    <div className="col-span-2 text-right">V.TOTAL($)</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {invoiceItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted p-4">
                      <Receipt className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-xs">No hay productos</p>
                      <p className="text-xs mt-2 text-blue-600">Haga click derecho aquí para activar navegación</p>
                    </div>
                  ) : (
                    <div>
                      {invoiceItems.map((item, index) => (
                        <div
                          key={item.product.id}
                          className={`relative group ${
                            index === focusedInvoiceIndex 
                              ? 'bg-blue-100 border-1 border-blue-300' 
                              : index === 0 
                                ? 'bg-blue-50/50 border-b-2 border-primary/30' 
                                : 'border-b border-border/30'
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-2 px-3 py-2.5 text-xs items-center">
                            <div className="col-span-2 font-semibold text-secondary">
                              {item.product.code?.substring(0, 6) || item.product.id.substring(0, 6)}
                            </div>
                            <div className="col-span-4">
                              <p className="text-secondary font-semibold line-clamp-1 text-xs">
                                {item.product.name}
                              </p>
                              <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                                {item.product.brand?.name || 'Sin marca'}
                              </p>
                            </div>
                            <div className="col-span-2 flex items-center justify-center gap-1">
                              <InvoiceItemRow
                                key={item.product.id}
                                item={item}
                                handleUpdateQuantity={handleUpdateQuantity}
                                isFocused={index === focusedInvoiceIndex}
                              />
                            </div>
                            <div className="col-span-2 text-right">
                              <p className="text-secondary font-bold text-xs">
                                {formatCurrency(item.unitPrice).replace(/\s/g, '').replace('$', '$ ')}
                              </p>
                              <p className="text-[10px] text-green-600 font-medium">
                                {item.product.taxes.name + " "+ item.product.taxes.rate*100 +"%"}
                              </p>
                            </div>
                            <div className="col-span-2 text-right text-secondary font-bold text-sm">
                              {formatCurrency(item.total).replace(/\s/g, '').replace('$', '$ ')}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.product.id)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition shadow-md"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Section */}
                <div className="border-t-2 border-border/60">
                  <div className="px-3 py-2 flex items-center justify-between text-xs">
                    <span className="text-muted font-medium">REG: ({invoiceItems.length})</span>
                    {focusedInvoiceIndex >= 0 && (
                      <span className="text-blue-600 font-semibold">
                        Producto seleccionado: {focusedInvoiceIndex + 1}/{invoiceItems.length}
                        {numberBuffer && (
                          <span className="ml-2 text-orange-600">
                            Entrada: {numberBuffer}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-3 border-y border-border">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-secondary mb-0.5">TOTAL</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(invoiceTotal).replace(/\s/g, '')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50">
                    <button
                      onClick={handleProcessInvoice}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition shadow-md"
                    >
                      - $ FACTURAR $ -
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {temporalProduct && ctrlModalProduct && (
        <ProductConfirmModal
          open={ctrlModalProduct}
          onClose={closeModal}
          onConfirm={handleAddProduct}
          product={temporalProduct}
          existence={temporalSummary.quantity}
        />
      )}
    </>
  );
};

export default PosPage;