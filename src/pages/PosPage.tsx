import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, User, DollarSign, FileText, CreditCard, Receipt, X, Plus, Minus, Printer, Users, LockKeyhole, FileSpreadsheet, PenLine, BookOpen, HelpCircle, Menu } from 'lucide-react';
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
import { Invoice, InvoiceItem } from '@/components/sales/invoiceComponent';


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
  
  const [focusedInvoiceIndex, setFocusedInvoiceIndex] = useState<number>(0);
  const [numberBuffer, setNumberBuffer] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingProductFromInvoice, setEditingProductFromInvoice] = useState<{
    product: Product;
    currentQuantity: number;
    currentUnitPrice: number;
  } | null>(null);
  const debouncedSearchInput = useDebounce(searchTerm, 150);
  const [params, setParams] = useState<ProductQueryParams>({
    pageableRequest: pageableRequest,
    keyWord: debouncedSearchInput
  });

  const { products, isLoading, totalPages, totalElements, currentPage } = useProducts(params);
  const [productsBank, setProductsBank] = useState<ProductSummary[]>([]);

  const { level, setLevel } = useKeyboardLevel("datatable");
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setParams({
      pageableRequest: pageableRequest,
      keyWord: debouncedSearchInput
    });
  }, [pageableRequest, debouncedSearchInput]);

  useEffect(() => {
    setProductsBank(products);
  }, [products]);

  useEffect(() => {
    if (level === "search" && searchRef.current) {
      searchRef.current.focus();
      searchRef.current.select();
    }
  }, [level]);

  useEffect(() => {
    if (level !== "parent") {
      setNumberBuffer('');
    }
  }, [level, focusedInvoiceIndex]);

  const processNumberInput = (key: string) => {
    if (level === "parent" && invoiceItems.length > 0 && focusedInvoiceIndex >= 0) {
      const currentItem = invoiceItems[focusedInvoiceIndex];
      if (!currentItem) return;

      let newBuffer = numberBuffer + key;
      
      if (newBuffer.length > 4) {
        newBuffer = newBuffer.slice(-4);
      }

      setNumberBuffer(newBuffer);

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        if (level === "search") {
          setLevel("datatable");
        } else {
          setLevel("search");
        }
      }
      
      if (e.key === "ArrowLeft" && e.ctrlKey) {
        e.preventDefault();
        setLevel("datatable");
        setFocusedInvoiceIndex(-1);
      }
      if (e.key === "ArrowRight" && e.ctrlKey) {
        e.preventDefault();
        setLevel("parent");
        if (invoiceItems.length > 0) {
          setFocusedInvoiceIndex(0);
        }
      }

      if (level === "search") {
        if (e.key === "Escape") {
          e.preventDefault();
          setLevel("datatable");
        }
        return;
      }

      if (level === "parent" && invoiceItems.length > 0) {
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          processNumberInput(e.key);
          return;
        }

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
              const currentItem = invoiceItems[focusedInvoiceIndex];
              const delta = 1 - currentItem.quantity;
              if (delta !== 0) {
                handleUpdateQuantity(currentItem.product.id, delta);
              }
            }
          }
          return;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          setNumberBuffer('');
          return;
        }

        if (e.key === "+" || e.key === "Add") {
          e.preventDefault();
          if (focusedInvoiceIndex >= 0 && focusedInvoiceIndex < invoiceItems.length) {
            handleUpdateQuantity(invoiceItems[focusedInvoiceIndex].product.id, 1);
          }
        }
        
        if (e.key === "-" || e.key === "Subtract") {
          e.preventDefault();
          if (focusedInvoiceIndex >= 0 && focusedInvoiceIndex < invoiceItems.length) {
            handleUpdateQuantity(invoiceItems[focusedInvoiceIndex].product.id, -1);
          }
        }

        // CORRECCIÓN: Invertir las flechas para que coincidan con el orden visual
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedInvoiceIndex(prev => 
            prev > 0 ? prev - 1 : invoiceItems.length - 1
          );
        }
        
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedInvoiceIndex(prev => 
            prev < invoiceItems.length - 1 ? prev + 1 : 0
          );
        }

        if (e.key === "Enter") {
          e.preventDefault();
          handleProcessInvoice();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [level, invoiceItems, focusedInvoiceIndex, numberBuffer]);

  const handleSearchBlur = () => {
    if (level === "search") {
      setTimeout(() => {
        setLevel("datatable");
      }, 100);
    }
  };

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
    setEditingProductFromInvoice(null);
    setCtrlModalProduct(false);
    setLevel("datatable");
  };

  const handleAddProduct = (delta = 0, selectedPrice?: number) => {
  if (!editingProductFromInvoice) {
    // Modo normal: agregar nuevo producto
    handleUpdateQuantity(temporalProduct.id, delta, selectedPrice);
    setTemporalProduct(null);
  } else {
    // Modo edición: actualizar producto existente
    const productId = editingProductFromInvoice.product.id;
    const currentItem = invoiceItems.find(item => item.product.id === productId);
    
    if (currentItem) {
      // Calcular la nueva cantidad basada en delta (que ahora representa la cantidad final)
      const newQuantity = delta;
      
      // Si el precio cambió, actualizar el precio manteniendo la posición
      if (selectedPrice && selectedPrice !== currentItem.unitPrice) {
        setInvoiceItems(prev =>
          prev.map(item =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: newQuantity,
                  unitPrice: selectedPrice,
                  total: newQuantity * selectedPrice
                }
              : item
          )
        );
        
        // Actualizar el stock en productsBank
        const quantityDelta = newQuantity - currentItem.quantity;
        if (quantityDelta !== 0) {
          setProductsBank(prev =>
            prev.map(item =>
              item.id === productId
                ? { ...item, quantity: item.quantity - quantityDelta }
                : item
            )
          );
        }
      } else {
        // Solo actualizar cantidad si el precio no cambió
        const quantityDelta = newQuantity - currentItem.quantity;
        if (quantityDelta !== 0) {
          handleUpdateQuantity(productId, quantityDelta);
        }
      }
    }
    setEditingProductFromInvoice(null);
  }
  
  // Mantener el foco en el producto editado
  if (editingProductFromInvoice) {
    const currentIndex = invoiceItems.findIndex(
      item => item.product.id === editingProductFromInvoice.product.id
    );
    if (currentIndex >= 0) {
      setFocusedInvoiceIndex(currentIndex);
    }
  }
};


  const handleUpdateQuantity = (productId: string, delta: number, selectedPrice?: number) => {
    const product = productsBank.find(p => p.id === productId);
    if (!product) return;

    const invoiceItem = invoiceItems.find(i => i.product.id === productId);
    const currentIndex = invoiceItems.findIndex(i => i.product.id === productId);

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
      
      setFocusedInvoiceIndex(invoiceItems.length);
      toast.success('Producto Agregado');
      return;
    }

    const newQty = invoiceItem.quantity + delta;
    const newStock = product.quantity - delta;

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

      if (focusedInvoiceIndex >= currentIndex) {
        setFocusedInvoiceIndex(prev => 
          prev > 0 ? prev - 1 : invoiceItems.length - 2 >= 0 ? 0 : -1
        );
      }
      return;
    }

    if (delta > 0 && newStock < 0) {
      toast.error("Stock insuficiente");
      return;
    }

    setProductsBank(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: newStock }
          : item
      )
    );

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

  const handleEditProductFromInvoice = (product: Product, currentQuantity: number, currentUnitPrice: number) => {
    setEditingProductFromInvoice({
      product,
      currentQuantity,
      currentUnitPrice
    });
    setTemporalProduct(product);
    setCtrlModalProduct(true);
    setTemporalSummary(productsBank.find(p => p.id === product.id) || null);
    setLevel("modal");
  };

  const handleRemoveItem = (productId: string) => {
    const productInvoice = invoiceItems.find((item) => item.product.id == productId);
    const currentIndex = invoiceItems.findIndex(i => i.product.id === productId);
    
    handleUpdateQuantity(productInvoice.product.id, -productInvoice.quantity);
    setInvoiceItems(items => items.filter(item => item.product.id !== productId));
    
    if (focusedInvoiceIndex >= currentIndex) {
      setFocusedInvoiceIndex(prev => 
        prev > 0 ? prev - 1 : invoiceItems.length - 2 >= 0 ? 0 : -1
      );
    }
    
    toast.info('Producto eliminado');
  };

  const handleClearInvoice = () => {
    invoiceItems.forEach((item)=> handleRemoveItem(item.product.id))
    setInvoiceItems([])
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

  const formatCurrency = (value: number) =>
    value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  return (
    <>
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          {/* Header Responsive */}
          <header className="bg-white border-b border-border/60 px-4 md:px-6 py-3 pos-page">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <Menu className="h-6 w-6 text-primary" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-primary">PUNTO DE VENTA</h1>
                  <p className="text-xs text-muted">EL MAYORISTA SAS</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startPosPageTour}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                  title="Iniciar tutorial"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition">
                  <User className="h-5 w-5 text-primary" />
                </button>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex gap-4 items-center justify-between">
              <div className='flex items-center justify-between gap-4'>
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

          {/* Mobile Sidebar Menu */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {/* Sidebar */}
              <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
                <div className="p-4 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-primary">Menú</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Client Info */}
                  <div className="bg-gradient-to-br from-primary to-primary/90 text-white p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6" />
                      <div>
                        <p className="text-xs font-medium opacity-90">CLIENTE</p>
                        <p className="font-bold text-sm">{selectedClient.name}</p>
                        <p className="text-xs mt-1">NIT/CC: {selectedClient.nit}</p>
                        <p className="text-xs">ASESOR: {selectedClient.seller}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-secondary">Acciones Rápidas</h3>
                    <button className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition text-sm font-semibold">
                      <FileSpreadsheet className="h-4 w-4" />
                      VER FACTURAS
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition text-sm font-semibold">
                      <LockKeyhole className="h-4 w-4" />
                      CIERRE DE CAJA
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold">
                      <FileText className="h-4 w-4" />
                      FACTURA NUEVA
                    </button>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-secondary">Opciones de Pago</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex flex-col items-center gap-1 p-2 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition text-xs">
                        <CreditCard className="h-4 w-4" />
                        CRÉDITO
                      </button>
                      <button className="flex flex-col items-center gap-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs">
                        <User className="h-4 w-4" />
                        VER CLIENTE
                      </button>
                      <button className="flex flex-col items-center gap-1 p-2 bg-white border border-border text-secondary rounded-lg hover:border-primary/40 hover:text-primary transition text-xs">
                        <FileText className="h-4 w-4" />
                        NOTA CRÉDITO
                      </button>
                      <button className="flex flex-col items-center gap-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs">
                        <Receipt className="h-4 w-4" />
                        REMISIÓN
                      </button>
                    </div>
                  </div>

                  {/* Manual Link */}
                  <a
                    className='w-full flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold transition border-transparent text-sm text-secondary hover:text-primary hover:bg-gray-50'
                    target="_blank"
                    href='https://docs-mayorista.vercel.app/'>
                    <BookOpen className='text-primary h-4 w-4'/>
                    Manual de Usuario
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
            <div className="md:col-span-3 flex flex-col gap-3">
              {/* Desktop Only Buttons */}
              <div className="hidden md:flex gap-2">
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

              <div onClick={()=>setLevel("search")} className="relative search-element">
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
                      level={level === "search" ? "search" : level}
                      onRowSelect={(row) => openModal(row)}
                      emptyState="No se encontraron productos con los filtros seleccionados."
                      isAvailableKeyBoard={level !== "search"}
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

            <Invoice
            invoiceItems={invoiceItems}
            focusedInvoiceIndex={focusedInvoiceIndex}
            numberBuffer={numberBuffer}
            level={level}
            handleUpdateQuantity={handleUpdateQuantity}
            handleRemoveItem={handleRemoveItem}
            handleClearInvoice={handleClearInvoice}
            handleProcessInvoice={handleProcessInvoice}
            setFocusedInvoiceIndex={setFocusedInvoiceIndex}
            setNumberBuffer={setNumberBuffer}
            onEditProduct={handleEditProductFromInvoice}
          />
          </div>
        </div>
      </div>
      {temporalProduct && ctrlModalProduct && (
        <ProductConfirmModal
          open={ctrlModalProduct}
          onClose={closeModal}
          onConfirm={handleAddProduct}
          product={temporalProduct}
          existence={temporalSummary?.quantity || 0}
          // Pasar información adicional si estamos en modo edición
          initialQuantity={editingProductFromInvoice?.currentQuantity}
          initialPrice={editingProductFromInvoice?.currentUnitPrice}
          isEditMode={!!editingProductFromInvoice}
        />
      )}
    </>
  );
};

export default PosPage;