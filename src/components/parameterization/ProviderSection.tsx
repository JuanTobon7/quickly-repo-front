import { useState } from "react";
import DataTable from "../ui/DataTable";
import ProviderForm from "./ProviderForm";
import { Plus } from "lucide-react";
import { useProviders } from "@/hooks/inventory/useProvider";

export default function ProviderSection() {
  const { providers, setProvider, remove, isLoading } = useProviders();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; contact?: string | null } | null>(null);

  const handleCancel = () => {
    setCreating(false);
    setEditing(null);
  };

  const columns = [
    { header: "Nombre", accessorKey: "name" },
    { header: "Contacto", accessorKey: "contact" },
    {
      header: "Acciones",
      cell: (ctx: any) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(ctx.row.original);
              setCreating(false);
            }}
            className="rounded-md border border-border px-2 py-1 text-sm"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("¿Eliminar proveedor?")) remove.mutate(ctx.row.original.id);
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
    <section className="space-y-4 rounded-md border overflow-hidden border-border/60 bg-white p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h3 className="text-lg font-semibold">Proveedores</h3>
          <p className="text-sm text-muted max-w-full sm:max-w-md">
            Registra proveedores y su contacto (opcional).
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
            title="Nuevo Proveedor"
            aria-label="Nuevo Proveedor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* DataTable con scroll horizontal en móviles */}
      <div className="overflow-hidden">
        <DataTable
          columns={columns}
          pageCount={providers.length}
          pageFun={() => {}}
          data={providers}
          isLoading={isLoading}
          emptyState="No hay proveedores"
        />
      </div>

      {/* Modales de Crear / Editar */}
      {creating && (
        <ProviderForm
          title="Crear Proveedor"
          onCancel={handleCancel}
          onSubmit={async ({ name, contact }) => {
            if (!name) return alert("El nombre es requerido");
            setProvider({ name, contact });
            handleCancel();
          }}
        />
      )}

      {editing && (
        <ProviderForm
          title={`Editar Proveedor: ${editing.name}`}
          initial={editing}
          onCancel={handleCancel}
          onSubmit={async ({ id, name, contact }) => {
            if (!id || !name) return;
            setProvider({ id, name, contact });
            handleCancel();
          }}
        />
      )}
    </section>
  );
}
