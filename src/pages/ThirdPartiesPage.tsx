import { useState } from 'react';
import { Users } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import EmployeeManagementModal from '../components/employees/EmployeeManagementModal';

const MODULE_TABS = [
  { label: 'Empleados', value: 'employees' },
  { label: 'Clientes', value: 'clients' },
  { label: 'Proveedores', value: 'suppliers' },
] as const;

const ThirdPartiesPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof MODULE_TABS)[number]['value']>('employees');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <MainLayout
      moduleName="Terceros"
      tabs={MODULE_TABS.map(({ label, value }) => ({ label, value }))}
      activeTab={activeTab}
      onTabChange={(next) =>
        setActiveTab(next as (typeof MODULE_TABS)[number]['value'])
      }
      activeSidebar="third-parties"
    >
      {activeTab === 'employees' && (
        <section className="h-auto w-full space-y-6 rounded-3xl border border-border/60 bg-white p-6 py-8 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary">Gestión de Empleados</h2>
              <p className="text-sm text-muted mt-1">
                Administre empleados y sus asignaciones a centros de costo
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition shadow-md"
            >
              <Users className="h-5 w-5" />
              <span>Gestionar Empleados</span>
            </button>
          </div>

          <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center">
            <Users className="mx-auto h-20 w-20 text-primary/40 mb-4" />
            <h3 className="text-xl font-semibold text-secondary mb-2">
              Gestión de Empleados y Centros de Costo
            </h3>
            <p className="text-muted max-w-md mx-auto mb-6">
              Haga clic en el botón "Gestionar Empleados" para asignar o remover empleados de centros de costo.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition"
            >
              <Users className="h-5 w-5" />
              <span>Abrir Gestión</span>
            </button>
          </div>
        </section>
      )}

      {activeTab === 'clients' && (
        <section className="h-auto w-full space-y-6 rounded-3xl border border-border/60 bg-white p-6 py-8 shadow-soft">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-secondary mb-2">Módulo de Clientes</h2>
            <p className="text-muted">En desarrollo...</p>
          </div>
        </section>
      )}

      {activeTab === 'suppliers' && (
        <section className="h-auto w-full space-y-6 rounded-3xl border border-border/60 bg-white p-6 py-8 shadow-soft">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-secondary mb-2">Módulo de Proveedores</h2>
            <p className="text-muted">En desarrollo...</p>
          </div>
        </section>
      )}

      <EmployeeManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </MainLayout>
  );
};

export default ThirdPartiesPage;
