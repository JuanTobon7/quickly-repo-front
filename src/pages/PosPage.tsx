import { useState, useMemo } from 'react';
import { Search, User, DollarSign, FileText, CreditCard, Receipt, X, Plus, Minus, Printer, Users, LockKeyhole, FileSpreadsheet, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/inventory/useProduct';
import type { Product } from '@/services/api/products';

type InvoiceItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const PosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [selectedClient, setSelectedClient] = useState({
    name: 'JULIAN GUILLEN CUBILLOS',
    nit: '93297332',
    seller: 'YEISON OSORIO'
  });

  // Fetch products
  const { products: allProducts, isLoading } = useProducts({ 
    pageableRequest: { size: 500, page: 0 }
  });

  // Filter products by search term (name, brand, description)
  const products = useMemo(() => {
    if (!searchTerm.trim()) return allProducts;
    
    const term = searchTerm.toLowerCase().trim();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.brand?.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.code?.toLowerCase().includes(term) ||
      product.barCode?.toLowerCase().includes(term) ||
      product.reference?.toLowerCase().includes(term)
    );
  }, [allProducts, searchTerm]);

  // Calculate totals
  const invoiceTotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  }, [invoiceItems]);

  const handleAddProduct = (product: Product) => {
    const existingItem = invoiceItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setInvoiceItems(items =>
        items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        )
      );
      toast.success(`Cantidad actualizada: ${product.name}`);
    } else {
      const unitPrice = product.cost || 25000; // Default price
      setInvoiceItems([...invoiceItems, {
        product,
        quantity: 1,
        unitPrice,
        total: unitPrice
      }]);
      toast.success(`Producto agregado: ${product.name}`);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setInvoiceItems(items =>
      items.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setInvoiceItems(items => items.filter(item => item.product.id !== productId));
    toast.info('Producto eliminado');
  };

  const handleClearInvoice = () => {
    setInvoiceItems([]);
    toast.info('Factura anulada');
  };

  const handleProcessInvoice = () => {
    if (invoiceItems.length === 0) {
      toast.error('Agregue productos a la factura');
      return;
    }
    toast.success('Procesando factura...');
    // Aquí iría la lógica de facturación
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-border/60 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">EMPRESA AUTORIZADA: EL MAYORISTA SAS</p>
              <h1 className="text-xl font-bold text-primary">Módulo: PUNTO DE VENTA</h1>
            </div>
            <div className="flex items-center gap-3">
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
          {/* Left Panel - Products */}
          <div className="w-[60%] flex flex-col gap-3 overflow-hidden">
            {/* Top Buttons Row */}
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

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="text"
                placeholder="Buscar productos por nombre, código o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-secondary placeholder:text-muted shadow-sm"
              />
            </div>

            {/* Products Table */}
            <div className="flex-1 bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-2 bg-gray-50 border-b border-border/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-secondary">
                  Productos Disponibles
                </h3>
                <span className="text-xs text-muted">
                  Mostrando del 1 al 20 de {products.length} Registros
                </span>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center flex-1">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-500 text-white sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-xs">IMAGEN</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">COD</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">DESCRIPCIÓN</th>
                        <th className="px-3 py-2 text-center font-semibold text-xs">EXIS</th>
                        <th className="px-3 py-2 text-right font-semibold text-xs">PRECIO</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">REF</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">COD BARRAS</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">UBIC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, index) => (
                        <tr
                          key={product.id}
                          onClick={() => handleAddProduct(product)}
                          className={`cursor-pointer hover:bg-blue-50 transition border-b border-border/30 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-3 py-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded flex items-center justify-center overflow-hidden">
                              <img 
                                src={`https://via.placeholder.com/48?text=${product.code?.substring(0, 2) || 'P'}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2 font-semibold text-secondary">
                            {product.code || product.id.substring(0, 8)}
                          </td>
                          <td className="px-3 py-2 text-secondary">
                            <div className="max-w-xs">
                              <p className="font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted">{product.brand.name}</p>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              25
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-primary">
                            {formatCurrency(product.cost || 25000)}
                          </td>
                          <td className="px-3 py-2 text-secondary text-xs">
                            {product.reference || '-'}
                          </td>
                          <td className="px-3 py-2 text-secondary text-xs">
                            {product.barCode || '-'}
                          </td>
                          <td className="px-3 py-2 text-secondary text-xs">
                            -
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

          {/* Right Panel - Invoice */}
          <div className="w-[40%] flex flex-col gap-3">
            {/* Action Buttons */}
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
            <div className="flex-1 bg-white rounded-xl border border-border/60 shadow-sm flex flex-col overflow-hidden">
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
                  </div>
                ) : (
                  <div>
                    {invoiceItems.map((item, index) => (
                      <div
                        key={item.product.id}
                        className={`relative group ${
                          index === 0 ? 'bg-blue-50/50 border-b-2 border-primary/30' : 'border-b border-border/30'
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
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, -1)}
                              className="p-1 hover:bg-red-100 rounded transition"
                            >
                              <Minus className="h-3.5 w-3.5 text-secondary" />
                            </button>
                            <span className="font-bold text-secondary w-7 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, 1)}
                              className="p-1 hover:bg-green-100 rounded transition"
                            >
                              <Plus className="h-3.5 w-3.5 text-secondary" />
                            </button>
                          </div>
                          <div className="col-span-2 text-right">
                            <p className="text-secondary font-bold text-xs">
                              {formatCurrency(item.unitPrice).replace(/\s/g, '').replace('$', '$ ')}
                            </p>
                            <p className="text-[10px] text-green-600 font-medium">
                              IVA: 19%
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
  );
};

export default PosPage;
