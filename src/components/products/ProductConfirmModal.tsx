import { Product } from "@/services/api/products";
import { getProductImages, ProductImage } from "@/services/api/productImages";
import { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";
import { roundPrice } from "@/utils/fun";

interface Props {
  open: boolean;
  product: Product;
  onClose: () => void;
  onConfirm: (qty: number, selectedPrice: number) => void;
  existence: number;
}


function calculatePrices(cost: number, percentage: number): number {
  // add profit
  const profit = cost * (percentage / 100);
  const price = cost + profit;

  // round to 100
  const roundedPrice = roundPrice(price, 100);

  return roundedPrice;
}




export default function ProductConfirmModal({
  open,
  product,
  onClose,
  onConfirm,
  existence
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [qty, setQty] = useState<number>(1);
  const [images, setImages] = useState<ProductImage[] | null>(null);
  const [mainImg, setMainImg] = useState<ProductImage | null>(null);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<number>(2); // Por defecto el nivel 3 (índice 2)

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

    open ? dialog.showModal() : dialog.close();
  }, [open]);

  if (!product) return null;

  function handleQtyChange(
    action: "inc" | "dec" | "set",
    value: number | string,
    setQty: Dispatch<SetStateAction<number>>,
    max: number
  ) {
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

      // Permitir borrar temporalmente
      if (raw === "") {
        setQty(0);
        return;
      }

      const num = Number(raw);
      if (Number.isNaN(num)) return;

      const sanitized = Math.max(1, Math.min(max, num));
      setQty(sanitized);
    }
  }


  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      className="w-full max-w-6xl rounded-xl border border-gray-300 bg-white shadow-xl p-0 overflow-hidden"
    >
      {/* HEADER */}
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
          </div>
        </div>
      </div>

      {/* BODY */}
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
              className="w-full max-w-[420px] h-[380px] object-contain rounded-lg border border-gray-200 bg-gray-50 p-4"
            />
          ) : (
            <div className="w-full max-w-[420px] h-[380px] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
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

          <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-2">
            {product.priceLevels?.map((pl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPriceLevel(idx)}
                className={`px-4 py-3 rounded-lg border-2 flex justify-between gap-4 items-center transition-all cursor-pointer flex-shrink-0 ${
                  selectedPriceLevel === idx
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-primary/40 hover:bg-gray-50'
                }`}
              >
                <span className={`font-semibold text-sm ${selectedPriceLevel === idx ? 'opacity-100' : 'opacity-70'}`}>
                  ({idx + 1})
                </span>

                <span className="font-medium text-sm flex-1 text-left">
                  {pl.name}
                </span>

                <span className="font-semibold">
                  ${calculatePrices(product.priceAfterTaxes, pl.profitPercentage).toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* CANTIDAD */}
          <div className="bg-white px-4 py-3 rounded-lg border-2 border-primary/30 max-h-[100px] overflow-y-auto">
            <label className="text-xs font-medium text-gray-600 block mb-2">CANTIDAD</label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleQtyChange("dec", 0, setQty, existence)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg transition"
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
                onChange={(e) =>
                  handleQtyChange("set", e.target.value, setQty, existence)
                }
                min={1}
                max={existence}
              />
              <button
                onClick={() => handleQtyChange("inc", 0, setQty, existence)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg transition"
              >
                +
              </button>
            </div>
          </div>

          {/* SUBTOTAL */}
          <div className="bg-primary px-4 py-3 rounded-lg border border-primary max-h-[90px] overflow-y-auto">
            <label className="text-xs font-medium text-white block mb-1">SUB TOTAL</label>
            <div className="text-xl font-bold text-white text-center">
              ${(calculatePrices(product.priceAfterTaxes, product.priceLevels?.[selectedPriceLevel]?.profitPercentage || 0) * qty).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-center items-center gap-5 bg-gray-50 border-t border-gray-200 px-6 py-4">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-secondary font-semibold text-lg transition"
        >
          CANCELAR
        </button>

        <button
          onClick={() => {
            const selectedPrice = calculatePrices(product.priceAfterTaxes, product.priceLevels?.[selectedPriceLevel]?.profitPercentage || 0);
            onConfirm(qty, selectedPrice);
          }}
          className="px-8 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-lg transition"
        >
          ADICIONAR
        </button>
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
        className={`mt-1 px-3 py-2 rounded bg-gray-100 text-gray-700 ${
          strong ? "text-lg font-semibold text-primary" : "font-medium"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
