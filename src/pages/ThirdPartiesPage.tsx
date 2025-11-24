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
        <section className="flex h-full min-h-[calc(100vh-12rem)] w-full flex-col space-y-6 rounded-3xl border border-border/60 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary">Gestión de Empleados</h2>
              <p className="mt-1 text-sm text-muted">
                Administre empleados y sus asignaciones a centros de costo
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-md transition hover:bg-primary/90"
            >
              <Users className="h-5 w-5" />
              <span>Gestionar Empleados</span>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center sm:p-12">
            <div className="max-w-md">
              <Users className="mx-auto mb-4 h-20 w-20 text-primary/40" />
              <h3 className="mb-2 text-xl font-semibold text-secondary">
                Gestión de Empleados y Centros de Costo
              </h3>
              <p className="mx-auto mb-6 text-muted">
                Haga clic en el botón "Gestionar Empleados" para asignar o remover empleados de centros de costo.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
              >
                <Users className="h-5 w-5" />
                <span>Abrir Gestión</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'clients' && (
        <section className="flex h-full min-h-[calc(100vh-12rem)] w-full items-center justify-center rounded-3xl border border-border/60 bg-white p-6 shadow-soft">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-secondary">Módulo de Clientes</h2>
            <p className="text-muted">En desarrollo...</p>
          </div>
        </section>
      )}

      {activeTab === 'suppliers' && (
        <section className="flex h-full min-h-[calc(100vh-12rem)] w-full items-center justify-center rounded-3xl border border-border/60 bg-white p-6 shadow-soft">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-secondary">Módulo de Proveedores</h2>
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
