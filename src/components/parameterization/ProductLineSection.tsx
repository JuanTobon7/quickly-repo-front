import { useState } from "react";
import DataTable from "../ui/DataTable";
import EntityForm from "./EntityForm";
import { Plus } from "lucide-react";
import { useProductLines } from "@/hooks/inventory/useProductLines";

export default function ProductLineSection() {
  const { productLines, setProductLine, remove, isLoading } = useProductLines();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const columns = [
    { header: "Nombre", accessorKey: "name" },
    {
      header: "Acciones",
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
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm("¿Eliminar Linea?")) await remove.mutateAsync(ctx.row.original.id);
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
          <h3 className="text-lg font-semibold">Línea</h3>
          <p className="text-sm text-muted max-w-full sm:max-w-md">Entidad para clasificar productos.</p>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => setCreating(true)}
            title="Nueva Línea"
            aria-label="Nueva Línea"
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
          pageCount={productLines.length}
          pageFun={() => {}}
          data={productLines}
          isLoading={isLoading}
          emptyState="No hay Lineas"
        />
      </div>

      {/* Modales de Crear / Editar */}
      {creating && (
        <EntityForm
          title="Crear Linea"
          example="Aceites"
          onCancel={() => setCreating(false)}
          onSubmit={async ({ name }) => {
            if (!name) return alert("El nombre es requerido");
            setProductLine({ name });
            setCreating(false);
          }}
        />
      )}

      {editing && (
        <EntityForm
          title={`Editar Linea: ${editing.name}`}
          example="Aceites"
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={async ({ id, name }) => {
            if (!id || !name) return;
            setProductLine({ id, name });
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
