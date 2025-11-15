import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart } from 'lucide-react';
import { getUser } from '@/services/api/auth';

export default function HomePage() {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/40 bg-primary/15 text-4xl font-bold text-primary shadow-lg">
            EM
          </div>
          <h1 className="text-3xl font-bold text-secondary">El Mayorista</h1>
          {user && (
            <p className="mt-2 text-sm text-muted">
              Bienvenido, {user.name} {user.lastname}
            </p>
          )}
        </div>

        {/* Module Selection */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-secondary">
            Seleccione un Módulo
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* POS Module */}
            <button
              onClick={() => navigate('/pos')}
              className="group relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 transition hover:border-primary hover:shadow-xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary/20">
                  <ShoppingCart className="h-12 w-12" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-secondary">
                    Punto de Venta
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    Gestión de ventas y facturación
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 transition group-hover:opacity-100" />
            </button>

            {/* Inventory Module */}
            <button
              onClick={() => navigate('/inventory')}
              className="group relative overflow-hidden rounded-xl border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 p-8 transition hover:border-accent hover:shadow-xl"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 text-accent transition group-hover:scale-110 group-hover:bg-accent/20">
                  <Package className="h-12 w-12" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-secondary">
                    Administración
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    Administración de productos y stock
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 transition group-hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted">
          © 2025 El Mayorista SAS. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
