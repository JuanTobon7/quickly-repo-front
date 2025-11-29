import { Product } from "@/services/api/products";
import { getProductImages, ProductImage } from "@/services/api/productImages";
import { useEffect, useRef, useState } from "react";
import { roundPrice } from "@/utils/fun";

interface Props {
  open: boolean;
  product: Product;
  onClose: () => void;
  onConfirm: (qty: number, selectedPrice: number) => void;
  existence: number;
  initialQuantity?: number; // Nueva prop para modo edición
  initialPrice?: number;    // Nueva prop para modo edición
  isEditMode?: boolean;     // Nueva prop para modo edición
}

function calculatePrices(cost: number, percentage: number): number {
  const profit = cost * (percentage / 100);
  const price = cost + profit;
  const roundedPrice = roundPrice(price, 100);
  return roundedPrice;
}

type Step = 1 | 2; // 1: Seleccionar precio, 2: Confirmar cantidad

export default function ProductConfirmModal({
  open,
  product,
  onClose,
  onConfirm,
  existence,
  initialQuantity = 1,
  initialPrice,
  isEditMode = false
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [qty, setQty] = useState<number>(initialQuantity);
  const [images, setImages] = useState<ProductImage[] | null>(null);
  const [mainImg, setMainImg] = useState<ProductImage | null>(null);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<number>(0);
  const priceButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Resetear estado cuando se abre con un nuevo producto
  useEffect(() => {
    if (!open) {
        setSelectedPriceLevel(0);
        return
    }
    setStep(1);
      setQty(isEditMode ? initialQuantity : 1);
      
      // Si hay un precio inicial en modo edición, encontrar el nivel de precio correspondiente
      if (isEditMode && initialPrice && product.priceLevels) {
        const priceLevelIndex = product.priceLevels.findIndex(pl => {
          const calculatedPrice = calculatePrices(product.priceAfterTaxes, pl.profitPercentage);
          return Math.abs(calculatedPrice - initialPrice) < 0.01; // Comparación con tolerancia
        });
        if (priceLevelIndex !== -1) {
          setSelectedPriceLevel(priceLevelIndex);
        } else {
          setSelectedPriceLevel(0);
        }
  }}, [open, product, isEditMode, initialQuantity, initialPrice]);

  // Fetch imágenes
  useEffect(() => {
    if (!product?.id) return;
    getProductImages(product.id).then(setImages);
  }, [product]);

  // Set main image
  useEffect(() => {
    if (!images) return;
    setMainImg(images.find((i) => i.mainImage) ?? images[0]);
  }, [images]);

  // open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      dialog.focus();
    } else {
      dialog.close();
    }
  }, [open]);

  // Scroll al precio seleccionado
  useEffect(() => {
    if (step === 1 && priceButtonRefs.current[selectedPriceLevel]) {
      priceButtonRefs.current[selectedPriceLevel]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [selectedPriceLevel, step]);

  // Manejo de eventos de teclado
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || !dialog.open) return;

      // Paso 1: Navegación de precios
      if (step === 1) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          setSelectedPriceLevel((prev) => Math.max(prev - 1, 0));
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          setSelectedPriceLevel((prev) =>
            Math.min(prev + 1, (product.priceLevels?.length ?? 1) - 1)
          );
          return;
        }

        // Enter para avanzar al paso 2
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          setStep(2);
          return;
        }
      }

      // Paso 2: Control de cantidad
      if (step === 2) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          e.stopPropagation();
          setQty((q) => Math.min(existence, q + 1));
          return;
        }

        if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          e.stopPropagation();
          setQty((q) => Math.max(1, q - 1));
          return;
        }

        // Enter para confirmar
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          const selectedPrice = calculatePrices(
            product.priceAfterTaxes,
            product.priceLevels?.[selectedPriceLevel]?.profitPercentage || 0
          );
          onConfirm(qty, selectedPrice);
          onClose();
          return;
        }

        // Escape para volver al paso 1
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setStep(1);
          return;
        }
      }

      // Escape global para cerrar
      if (e.key === "Escape" && e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
    };

    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
    };
  }, [open, step, qty, selectedPriceLevel, product, existence, onConfirm, onClose]);

  const handleQtyChange = (
    action: "inc" | "dec" | "set",
    value: number | string = 0,
    max: number = existence
  ) => {
    if (action === "inc") {
      setQty((q) => Math.min(max, q + 1));
      return;
    }

    if (action === "dec") {
      setQty((q) => Math.max(1, q - 1));
      return;
    }

    if (action === "set") {
      const raw = value;
      if (raw === "") {
        setQty(0);
        return;
      }

      const num = Number(raw);
      if (Number.isNaN(num)) return;

      const sanitized = Math.max(1, Math.min(max, num));
      setQty(sanitized);
    }
  };

  const selectedPrice = calculatePrices(
    product.priceAfterTaxes,
    product.priceLevels?.[selectedPriceLevel]?.profitPercentage || 0
  );

  // Calcular la nueva existencia después del descuento
  const newExistence = existence - qty;

  if (!product) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="w-full max-w-6xl rounded-xl border border-gray-300 bg-white shadow-xl p-2 backdrop:bg-black/50 z-10 overflow-y-auto"
    >
      {/* HEADER - Se mantiene igual en ambos pasos */}
      <div className="flex flex-col md:flex-row gap-4 bg-gray-50 border-b border-gray-200 p-5 w-auto">
        <div className="w-auto">
          <label className="text-xs text-gray-600">CÓDIGO</label>
          <div className="mt-1 text-lg font-semibold bg-gray-100 px-3 py-2 rounded text-primary">
            {product.code || "M1001PC"}
          </div>
        </div>

        <div className="flex-1">
          <label className="text-xs text-gray-600">NOMBRE</label>
          <div className="mt-1 bg-gray-100 px-3 py-2 rounded font-medium text-gray-700">
            {product.name}
            {isEditMode && (
              <span className="ml-2 text-sm text-blue-600 font-semibold">
                (Editando)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BODY - Cambia según el paso */}
      {step === 1 ? (
        // PASO 1: SELECCIÓN DE PRECIO
        <div className="flex flex-col lg:flex-row gap-6 p-6 bg-white">
          {/* LEFT INFO */}
          <div className="flex flex-col gap-4 w-full lg:w-[220px]">
            <InfoBlock label="EXISTENCIA" value={existence || 0} strong/>
            <InfoBlock label="UBICACIÓN" value="Estan 2" />
            <InfoBlock label="REFERENCIA" value={product.reference} />
            <InfoBlock label="CÓDIGO DE BARRAS" value={product.barCode} />
            <InfoBlock label="MARCA" value={product.brand.name} />
          </div>

          {/* IMAGE */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-0">
            {mainImg ? (
              <img
                src={mainImg.filePath}
                alt={product.name}
                className="w-full max-w-[600px] h-[500px] object-contain rounded-lg border border-gray-200 bg-gray-50 p-4"
              />
            ) : (
              <div className="w-full max-w-[600px] h-[500px] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                No image
              </div>
            )}

            <div className="mt-3 text-base font-semibold text-gray-700">
              {product.code}
            </div>
          </div>

          {/* PRICES */}
          <div className="flex flex-col gap-3 w-full lg:w-[260px]">
            <label className="text-xs font-medium text-gray-600">PRECIOS</label>

            <div className="flex flex-col gap-3 max-h-full overflow-y-auto pr-2">
              {product.priceLevels?.map((pl, idx) => (
                <button
                  ref={el => priceButtonRefs.current[idx] = el}
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPriceLevel(idx);
                    setStep(2); // Avanzar al paso 2 al seleccionar precio
                  }}
                  className={`px-4 py-3 rounded-lg border-2 flex justify-between gap-4 items-center transition-all cursor-pointer flex-shrink-0 ${
                    selectedPriceLevel === idx
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-primary/40 hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-semibold text-sm ${selectedPriceLevel === idx ? 'opacity-100' : 'opacity-70'}`}>
                    ({idx + 1})
                  </span>

                  <span className="font-semibold text-xl">
                    ${calculatePrices(product.priceAfterTaxes, pl.profitPercentage).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500 text-center mt-2">
              Selecciona un precio para continuar
            </div>
          </div>
        </div>
      ) : (
        // PASO 2: CONFIRMACIÓN DE CANTIDAD
        <div className="flex flex-col items-center p-6 bg-white">
          {/* PRODUCT CARD */}
          <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            {/* IMAGE */}
            <div className="flex justify-center mb-4">
              {mainImg ? (
                <img
                  src={mainImg.filePath}
                  alt={product.name}
                  className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-gray-50 p-2"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="text-center mb-6">
              <div className="text-lg font-semibold text-primary mb-1">
                {product.code}
              </div>
              <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.name}
              </div>
              <div className="text-2xl font-bold text-primary">
                ${selectedPrice.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Precio nivel {selectedPriceLevel + 1}
              </div>
            </div>

            {/* DESCUENTO EN EXISTENCIA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-sm font-medium text-blue-800 text-center mb-2">
                DESCUENTO EN EXISTENCIA
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Existencia actual:</span>
                <span className="font-semibold text-gray-700">{existence}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Cantidad a descontar:</span>
                <span className="font-semibold text-red-600">-{qty}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1 border-t border-blue-200 pt-1">
                <span className="text-gray-600 font-medium">Nueva existencia:</span>
                <span className={`font-bold ${newExistence < 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {newExistence}
                </span>
              </div>
              {newExistence < 5 && newExistence > 0 && (
                <div className="text-xs text-orange-600 text-center mt-2">
                  ⚠️ Stock bajo
                </div>
              )}
              {newExistence === 0 && (
                <div className="text-xs text-red-600 text-center mt-2">
                  ⚠️ Sin stock después de esta venta
                </div>
              )}
            </div>

            {/* QUANTITY AND SUBTOTAL */}
            <div className="space-y-4">
              {/* CANTIDAD */}
              <div className="bg-white px-4 py-3 rounded-lg border-2 border-primary/30">
                <label className="text-xs font-medium text-gray-600 block mb-2 text-center">
                  CANTIDAD
                </label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleQtyChange("dec")}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg transition"
                    aria-label="Reducir cantidad"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="
                      w-16 text-center text-xl font-bold text-secondary
                      border-2 border-border rounded-lg px-2 py-1.5
                      focus:outline-none focus:ring-2 focus:ring-primary/50
                      [&::-webkit-outer-spin-button]:appearance-none
                      [&::-webkit-inner-spin-button]:appearance-none
                      [-moz-appearance:textfield]
                    "
                    value={qty === 0 ? "" : qty}
                    onChange={(e) => handleQtyChange("set", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    min={1}
                    max={existence}
                    aria-label="Cantidad del producto"
                  />
                  <button
                    onClick={() => handleQtyChange("inc")}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg transition"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* SUBTOTAL */}
              <div className="bg-primary px-4 py-3 rounded-lg border border-primary">
                <label className="text-xs font-medium text-white block mb-1 text-center">
                  SUB TOTAL
                </label>
                <div className="text-2xl font-bold text-white text-center">
                  ${(selectedPrice * qty).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 text-center">
            Disponible: {existence} unidades
          </div>
        </div>
      )}

      {/* FOOTER - Cambia según el paso */}
      <div className="flex justify-center items-center gap-5 bg-gray-50 border-t border-gray-200 px-6 py-4">
        {step === 1 ? (
          // PASO 1: Solo cancelar
          <>
            <button
              onClick={onClose}
              className="px-4 py-1 md:px-8 md:py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-secondary font-semibold text-lg transition"
            >
              CANCELAR
            </button>
          </>
        ) : (
          // PASO 2: Volver, cancelar y confirmar
          <div className="flex flex-wrap justify-around items-center gap-2">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 md:px-8 md:py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-secondary font-semibold text-lg transition"
            >
              VOLVER
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 md:px-8 md:py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-secondary font-semibold text-lg transition"
            >
              CANCELAR
            </button>

            <button
              onClick={() => {
                onConfirm(qty, selectedPrice);
                onClose();
              }}
              className="px-5 py-2 md:px-8 md:py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-lg transition"
            >
              {isEditMode ? 'ACTUALIZAR' : 'ADICIONAR'}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}

/* --- small helper --- */
function InfoBlock({ label, value, strong = false }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div
        className={`px-3 py-2 rounded bg-gray-100 text-gray-700 ${
          strong ? "text-lg font-semibold text-primary" : "font-medium"
        }`}
      >
        {value}
      </div>
    </div>
  );
}