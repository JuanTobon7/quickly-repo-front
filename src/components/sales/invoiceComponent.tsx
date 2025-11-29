// components/sales/invoiceComponent.tsx
import { Product } from "@/services/api/products";
import { CreditCard, FileText, Receipt, User, X, Edit } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export type InvoiceItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
};

// Componente para la fila de item de factura
export function InvoiceItemRow({ item, handleUpdateQuantity, isFocused = false }) {
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

// Componente Invoice refactorizado - VERSIÓN CORREGIDA
export interface InvoiceProps {
  invoiceItems: InvoiceItem[];
  focusedInvoiceIndex: number;
  numberBuffer: string;
  level: string;
  handleUpdateQuantity: (productId: string, delta: number, selectedPrice?: number) => void;
  handleRemoveItem: (productId: string) => void;
  handleClearInvoice: () => void;
  handleProcessInvoice: () => void;
  setFocusedInvoiceIndex: (index: number) => void;
  setNumberBuffer: (buffer: string) => void;
  onEditProduct?: (product: Product, currentQuantity: number, currentUnitPrice: number) => void;
}

export const Invoice = ({
  invoiceItems,
  focusedInvoiceIndex,
  numberBuffer,
  level,
  handleUpdateQuantity,
  handleRemoveItem,
  handleClearInvoice,
  handleProcessInvoice,
  setFocusedInvoiceIndex,
  setNumberBuffer,
  onEditProduct
}: InvoiceProps) => {
  const invoiceItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const invoiceContainerRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) =>
    value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  // Calcular total
  const invoiceTotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  }, [invoiceItems]);

  // Calcular el índice visual (invertido) para el foco
  const getVisualIndex = (originalIndex: number) => {
    return invoiceItems.length - 1 - originalIndex;
  };

  // Obtener el índice original desde el índice visual
  const getOriginalIndex = (visualIndex: number) => {
    return invoiceItems.length - 1 - visualIndex;
  };

  // Efecto para hacer scroll al item enfocado
  useEffect(() => {
    if (level === "parent" && focusedInvoiceIndex >= 0 && invoiceItems.length > 0) {
      const visualIndex = getVisualIndex(focusedInvoiceIndex);
      const focusedElement = invoiceItemRefs.current[visualIndex];
      if (focusedElement) {
        setTimeout(() => {
          focusedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }, 50);
      }
    }
  }, [focusedInvoiceIndex, level, invoiceItems.length]);

  // Manejar click derecho para iniciar navegación
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (invoiceItems.length > 0 && level === "parent") {
      // Enfocar el primer elemento visual (último agregado)
      setFocusedInvoiceIndex(invoiceItems.length - 1);
      toast.info(`Navegación activada. Producto ${invoiceItems[invoiceItems.length - 1].product.name} seleccionado. Use ↑/↓ para navegar, +/- para modificar cantidades y teclas numéricas para cantidades directas.`);
    }
  };

  // Manejar clic en un item para enfocarlo
  const handleItemClick = (originalIndex: number) => {
    if (level === "parent") {
      setFocusedInvoiceIndex(originalIndex);
    }
  };

  // Manejar doble clic para editar producto
  const handleItemDoubleClick = (item: InvoiceItem, originalIndex: number) => {
    if (onEditProduct) {
      onEditProduct(item.product, item.quantity, item.unitPrice);
    }
  };

  return (
    <div 
      className="md:col-span-2 flex flex-col gap-3"
      ref={invoiceContainerRef}
      onContextMenu={handleContextMenu}
    >
      {/* Desktop Only Payment Options */}
      <div className="hidden md:grid grid-cols-2 gap-2.5">
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

        <div className="overflow-y-auto max-h-96">
          {invoiceItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted p-4">
              <Receipt className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-xs">No hay productos</p>
              <p className="text-xs mt-2 text-blue-600">Haga click derecho aquí para activar navegación</p>
            </div>
          ) : (
            <div>
              {invoiceItems
                .slice() // Crear una copia para no mutar el array original
                .reverse() // Mostrar los más recientes primero
                .map((item, visualIndex) => {
                  // Calcular el índice original
                  const originalIndex = getOriginalIndex(visualIndex);
                  const isFocused = originalIndex === focusedInvoiceIndex;
                  
                  return (
                    <div
                      key={item.product.id}
                      ref={el => invoiceItemRefs.current[visualIndex] = el}
                      onClick={() => handleItemClick(originalIndex)}
                      onDoubleClick={() => handleItemDoubleClick(item, originalIndex)}
                      className={`relative group cursor-pointer p-1 ${
                        isFocused
                          ? 'bg-blue-100 border-2 border-blue-400 shadow-md' 
                          : visualIndex === 0 
                            ? 'bg-blue-50/50 border-b-2 border-primary/30' 
                            : 'border-b border-border/30'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-2 px-3 py-3 text-xs items-center">
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
                            isFocused={isFocused}
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
                        
                        {/* Botones de acción */}
                        <div className="absolute top-0.5 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEditProduct) {
                                onEditProduct(item.product, item.quantity, item.unitPrice);
                              }
                            }}
                            className="bg-blue-500 text-white rounded-full px-1 py-1 hover:bg-blue-600 transition shadow-md"
                            title="Editar producto"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.product.id);
                            }}
                            className="bg-red-500 text-white rounded-full px-1 py-1 hover:bg-red-600 transition shadow-md"
                            title="Eliminar producto"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Total Section */}
        <div className="border-t-2 border-border/60">
          <div className="px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-muted font-medium">REG: ({invoiceItems.length})</span>
            {focusedInvoiceIndex >= 0 && invoiceItems.length > 0 && (
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
  );
};