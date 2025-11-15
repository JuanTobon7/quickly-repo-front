import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/ui/DataTable';
import { Tax, CreateTaxPayload } from '@/services/api/taxes';
import { useTaxes } from '@/hooks/inventory/useTaxes';

export function TaxSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const { taxes, isLoading, createTax, updateTax, deleteTax } = useTaxes();

  const handleCreate = async (payload: CreateTaxPayload) => {
    try {
      createTax(payload);
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (id: string, payload: CreateTaxPayload) => {
    try {
      updateTax({ id, payload });
      setEditingTax(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este impuesto?')) return;
    
    try {
      deleteTax(id);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { header: 'Nombre', accessorKey: 'name' },
    { 
      header: 'Tasa (%)',
      cell: (ctx: any) => `${(ctx.row.original.rate * 100).toFixed(2)}%`
    },
    { 
      header: 'Ventas',
      cell: (ctx: any) => ctx.row.original.forSales ? '✓' : '✗'
    },
    { 
      header: 'Compras',
      cell: (ctx: any) => ctx.row.original.forPurchases ? '✓' : '✗'
    },
    {
      header: 'Acciones',
      cell: (ctx: any) => {
        const row = ctx.row.original as Tax;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingTax(row);
                setIsFormOpen(true);
              }}
              className="rounded bg-blue-100 p-1.5 text-blue-600 hover:bg-blue-200"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              className="rounded bg-red-100 p-1.5 text-red-600 hover:bg-red-200"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary">Impuestos</h3>
          <p className="text-sm text-muted">
            Configure los impuestos aplicables a ventas y compras (ej: IVA, INC)
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTax(null);
            setIsFormOpen(true);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
          title="Nuevo Impuesto"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {isFormOpen && (
        <TaxForm
          initial={editingTax || undefined}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTax(null);
          }}
          onSubmit={(data) => {
            if (editingTax) {
              handleUpdate(editingTax.id, data);
            } else {
              handleCreate(data);
            }
          }}
        />
      )}

      <DataTable
        data={taxes}
        columns={columns}
        pageCount={taxes.length}
        pageFun={() => {}}
        isLoading={isLoading}
        emptyState="No hay impuestos registrados"
      />
    </div>
  );
}

type TaxFormProps = {
  initial?: Tax;
  onCancel: () => void;
  onSubmit: (data: CreateTaxPayload) => void;
};

function TaxForm({ initial, onCancel, onSubmit }: TaxFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [rate, setRate] = useState(initial?.rate ? initial.rate * 100 : 0); // Mostrar como porcentaje
  const [forSales, setForSales] = useState(initial?.forSales ?? true);
  const [forPurchases, setForPurchases] = useState(initial?.forPurchases ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (rate <= 0) {
      toast.error('La tasa debe ser mayor a 0');
      return;
    }

    onSubmit({
      name: name.trim(),
      rate: rate / 100, // Convertir de porcentaje a decimal
      forSales,
      forPurchases,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-lg border border-border bg-gray-50 p-4">
      <h4 className="mb-3 font-semibold text-secondary">
        {initial ? 'Editar Impuesto' : 'Nuevo Impuesto'}
      </h4>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary">
            Nombre del impuesto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: IVA, INC"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-secondary">
            Tasa (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            placeholder="Ej: 19"
            step="0.01"
            min="0"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
            required
          />
          <p className="mt-1 text-xs text-muted">
            Ingrese el porcentaje (ej: 19 para 19%)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={forSales}
              onChange={(e) => setForSales(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm text-secondary">Aplica a ventas</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={forPurchases}
              onChange={(e) => setForPurchases(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm text-secondary">Aplica a compras</span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
