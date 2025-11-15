import { useState } from 'react';
import { X, Plus, Loader2, Building2, Trash2 } from 'lucide-react';
import { useEmployees } from '@/hooks/inventory/useEmployees';
import { useEmployeeCostCenters } from '@/hooks/inventory/useEmployeeCostCenters';
import { useCostCenters } from '@/hooks/inventory/useCostCenters';
import type { Employee } from '@/services/api/employees';

type EmployeeManagementModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EmployeeManagementModal({ isOpen, onClose }: EmployeeManagementModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedCostCenterId, setSelectedCostCenterId] = useState<string>('');

  // Solo cargar datos cuando el modal esté abierto
  const { employees, isLoading: loadingEmployees, error: employeesError } = useEmployees({ enabled: isOpen });
  const { costCenters: allCostCenters, isLoading: loadingCostCenters, error: costCentersError } = useCostCenters({ enabled: isOpen });
  const {
    costCenters: employeeCostCenters,
    isLoading: loadingEmployeeCostCenters,
    assignCostCenter,
    removeCostCenter,
    assignMutation,
    removeMutation,
  } = useEmployeeCostCenters(selectedEmployee?.id ?? null);

  if (!isOpen) return null;

  const hasErrors = employeesError || costCentersError;

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedCostCenterId('');
  };

  const handleAssign = () => {
    if (!selectedCostCenterId) return;
    assignCostCenter(selectedCostCenterId);
    setSelectedCostCenterId('');
  };

  const handleRemove = (costCenterId: string) => {
    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      removeCostCenter(costCenterId);
    }
  };

  // Filter out already assigned cost centers
  const availableCostCenters = allCostCenters.filter(
    (cc) => !employeeCostCenters.some((ecc) => ecc.id === cc.id)
  );

  const isProcessing = assignMutation.isPending || removeMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Gestión de Empleados</h2>
            <p className="text-sm text-muted">Administrar asignaciones a centros de costo</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <X className="h-6 w-6 text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {hasErrors ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">
                  Error al cargar datos
                </h3>
                <p className="text-sm text-muted mb-4">
                  No se pudieron cargar los empleados o centros de costo. Esto puede deberse a que los endpoints no están disponibles o requieren configuración adicional.
                </p>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* Left Panel - Employee List */}
          <div className="w-1/2 border-r border-border flex flex-col">
            <div className="border-b border-border bg-gray-50 px-4 py-3">
              <h3 className="font-semibold text-secondary">Empleados</h3>
              <p className="text-xs text-muted">Seleccione un empleado para ver sus asignaciones</p>
            </div>

            {loadingEmployees ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className={`w-full border-b border-border px-4 py-3 text-left transition hover:bg-gray-50 ${
                      selectedEmployee?.id === employee.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <p className="font-semibold text-secondary">
                      {employee.name} {employee.lastname}
                    </p>
                    <p className="text-sm text-muted">{employee.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {employee.costCenterIds?.length || 0} centro(s) asignado(s)
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Cost Centers Management */}
          <div className="w-1/2 flex flex-col">
            {!selectedEmployee ? (
              <div className="flex flex-1 items-center justify-center text-center p-8">
                <div>
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-muted/40" />
                  <p className="text-muted">Seleccione un empleado para ver sus centros de costo</p>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-border bg-gray-50 px-4 py-3">
                  <h3 className="font-semibold text-secondary">
                    {selectedEmployee.name} {selectedEmployee.lastname}
                  </h3>
                  <p className="text-xs text-muted">{selectedEmployee.email}</p>
                </div>

                {/* Assigned Cost Centers */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h4 className="mb-3 text-sm font-semibold text-secondary">Centros de Costo Asignados</h4>

                  {loadingEmployeeCostCenters ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : employeeCostCenters.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-gray-50 p-6 text-center">
                      <p className="text-sm text-muted">No hay centros de costo asignados</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {employeeCostCenters.map((costCenter) => (
                        <div
                          key={costCenter.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-secondary">{costCenter.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(costCenter.id)}
                            disabled={isProcessing}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assign New Cost Center */}
                  <div className="mt-6">
                    <h4 className="mb-3 text-sm font-semibold text-secondary">Asignar Nuevo Centro de Costo</h4>
                    <div className="flex gap-2">
                      <select
                        value={selectedCostCenterId}
                        onChange={(e) => setSelectedCostCenterId(e.target.value)}
                        disabled={loadingCostCenters || isProcessing}
                        className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50"
                      >
                        <option value="">Seleccione un centro de costo...</option>
                        {availableCostCenters.map((cc) => (
                          <option key={cc.id} value={cc.id}>
                            {cc.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssign}
                        disabled={!selectedCostCenterId || isProcessing}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        <span>Asignar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-white px-6 py-2 font-semibold text-secondary hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
