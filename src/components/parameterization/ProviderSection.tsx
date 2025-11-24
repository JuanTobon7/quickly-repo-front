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
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(ctx.row.original);
              setCreating(false);
            }}
            className="rounded-md border border-border px-2 py-1 text-xs sm:text-sm"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("¿Eliminar proveedor?")) remove.mutate(ctx.row.original.id);
            }}
            className="rounded-md border border-border px-2 py-1 text-xs sm:text-sm text-danger"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4 rounded-md border border-border/60 bg-white p-4 overflow-hidden">

      {/* HEADER — RESPONSIVE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">

        <div className="flex flex-col  gap-1 sm:gap-4">
          <h3 className="text-lg font-semibold">Proveedores</h3>
          <p className="text-sm text-muted max-w-full sm:max-w-sm">
            Registra proveedores y su contacto (opcional).
          </p>
        </div>

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
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* TABLE WRAPPER — SCROLL RESPONSIVE */}
      <div className="overflow-x-auto rounded-md border border-border/40">
        <div className="min-w-[500px]">
          <DataTable
            columns={columns}
            pageCount={providers.length}
            pageFun={() => {}}
            data={providers}
            isLoading={isLoading}
            emptyState="No hay proveedores"
          />
        </div>
      </div>

      {/* FORMULARIOS */}
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
