import { useState } from 'react';
import DataTable from '../ui/DataTable';
import EntityForm from './EntityForm';
import { Plus } from 'lucide-react';
import { useGroupTypes } from '@/hooks/inventory/useGroupType';

export default function GroupTypeSection() {
  const { groupTypes, setGroupType, remove, isLoading } = useGroupTypes();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const columns = [
    { header: 'Nombre', accessorKey: 'name' },
    {
      header: 'Acciones',
      cell: (ctx: any) => (
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(ctx.row.original);
              setCreating(false);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm flex-1 sm:flex-none"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('¿Eliminar tipo de grupo?')) remove.mutate(ctx.row.original.id);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm text-danger flex-1 sm:flex-none"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  const handleCancel = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <section className="space-y-4 rounded-md border border-border/60 bg-white p-4 h-full w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <div>
          <h3 className="text-lg font-semibold">Tipos de Grupo</h3>
          <p className="text-sm text-muted">
            Aquí se registran los tipos de grupo de productos, por ejemplo: Materia Prima, Productos Procesados, Productos Terminados, Punto de Venta, Salsas, Servicios.
          </p>
        </div>
        <div className="flex justify-start sm:justify-end">
          <button
            type="button"
            onClick={() => setCreating(true)}
            title="Nuevo Tipo de Grupo"
            aria-label="Nuevo Tipo de Grupo"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={groupTypes}
          pageCount={groupTypes.length}
          pageFun={()=>{}}
          isLoading={isLoading}
          emptyState="No hay tipos de grupo"
        />
      </div>

      {/* Forms */}
      {creating && (
        <EntityForm
          title="Crear Tipo de Grupo"
          example='Materia Prima'
          onCancel={handleCancel}
          onSubmit={async ({ name }) => {
            if (!name) return alert('El nombre es requerido');
            setGroupType({ name });
            handleCancel();
          }}
        />
      )}

      {editing && (
        <EntityForm
          title={`Editar Tipo de Grupo: ${editing.name}`}
          example='Materia Prima'
          initial={editing}
          onCancel={handleCancel}
          onSubmit={async ({ id, name }) => {
            if (!id || !name) return;
            setGroupType({ id, name });
            handleCancel();
          }}
        />
      )}
    </section>
  );
}
