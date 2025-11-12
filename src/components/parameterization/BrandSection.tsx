import { useState } from 'react';
import DataTable from '../ui/DataTable';
import EntityForm from './EntityForm';
import { Plus } from 'lucide-react';
import { Brand } from '../../services/api/brands';
import { useBrands } from '@/hooks/inventory/useBrands';

export default function BrandSection() {
  const { brands = [], setBrand, remove, isLoading } = useBrands();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);

  function handleCreate(name: string) {
    setBrand({ name });
  }

  function handleUpdate(id: string, name: string) {
    setBrand({ id, name });
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar marca?')) return;
    remove.mutate(id);
  }

  const columns = [
    { header: 'Nombre', accessorKey: 'name' },
    {
      header: 'Acciones',
      cell: (ctx: any) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(ctx.row.original);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(ctx.row.original.id);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm text-danger"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4 rounded-md border border-border/60 bg-white p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h3 className="text-lg font-semibold">Marcas</h3>
          <p className="text-sm text-muted max-w-full sm:max-w-md">
            Esta entidad es necesaria para la creación de productos (marca de los productos que se registran).
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => setCreating(true)}
            title="Nueva Marca"
            aria-label="Nueva Marca"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* DataTable con scroll horizontal en móvil */}
      <div className="overflow-x-auto">
        <DataTable 
          columns={columns} 
          data={brands}
          pageCount={brands.length}
          pageFun={()=>{}}
          isLoading={isLoading} 
          emptyState="No hay marcas" 
        />
      </div>

      {/* Modales de Crear / Editar */}
      {creating && (
        <EntityForm
          title="Crear Marca"
          example='Michelin'
          onCancel={() => setCreating(false)}
          onSubmit={async ({ name }) => {
            if (!name) return alert('El nombre es requerido');
            await handleCreate(name);
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <EntityForm
          title={`Editar Marca: ${editing.name}`}
          initial={editing}
          example='Michelin'
          onCancel={() => setEditing(null)}
          onSubmit={async ({ id, name }) => {
            if (!id) return;
            if (!name) return alert('El nombre es requerido');
            await handleUpdate(id, name);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
