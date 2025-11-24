import { useState } from 'react';
import { createPortal } from 'react-dom';
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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex my-8 h-auto max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-xl font-bold text-secondary sm:text-2xl">Gestión de Empleados</h2>
            <p className="text-xs text-muted sm:text-sm">Administrar asignaciones a centros de costo</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-gray-100 sm:h-10 sm:w-10"
          >
            <X className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {hasErrors ? (
            <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-secondary">
                  Error al cargar datos
                </h3>
                <p className="mb-4 text-sm text-muted">
                  No se pudieron cargar los empleados o centros de costo.
                </p>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-primary/90"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* Left Panel - Employee List */}
          <div className="flex w-full flex-col border-b border-border md:w-1/2 md:border-b-0 md:border-r">
            <div className="border-b border-border bg-gray-50 px-3 py-2 sm:px-4 sm:py-3">
              <h3 className="font-semibold text-secondary">Empleados</h3>
              <p className="text-xs text-muted">Seleccione un empleado para ver sus asignaciones</p>
            </div>

            {loadingEmployees ? (
              <div className="flex flex-1 items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className={`w-full border-b border-border px-3 py-2.5 text-left transition hover:bg-gray-50 sm:px-4 sm:py-3 ${
                      selectedEmployee?.id === employee.id ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold text-secondary sm:text-base">
                      {employee.name} {employee.lastname}
                    </p>
                    <p className="text-xs text-muted sm:text-sm">{employee.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
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
          <div className="flex w-full flex-col md:w-1/2">
            {!selectedEmployee ? (
              <div className="flex flex-1 items-center justify-center p-4 text-center sm:p-8">
                <div>
                  <Building2 className="mx-auto mb-4 h-12 w-12 text-muted/40 sm:h-16 sm:w-16" />
                  <p className="text-sm text-muted sm:text-base">Seleccione un empleado para ver sus centros de costo</p>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-border bg-gray-50 px-3 py-2 sm:px-4 sm:py-3">
                  <h3 className="font-semibold text-secondary">
                    {selectedEmployee.name} {selectedEmployee.lastname}
                  </h3>
                  <p className="text-xs text-muted">{selectedEmployee.email}</p>
                </div>

                {/* Assigned Cost Centers */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                  <h4 className="mb-3 text-sm font-semibold text-secondary">Centros de Costo Asignados</h4>

                  {loadingEmployeeCostCenters ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : employeeCostCenters.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-gray-50 p-4 text-center sm:p-6">
                      <p className="text-sm text-muted">No hay centros de costo asignados</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {employeeCostCenters.map((costCenter) => (
                        <div
                          key={costCenter.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-white p-2.5 shadow-sm sm:p-3"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                              <Building2 className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-secondary sm:text-base">{costCenter.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(costCenter.id)}
                            disabled={isProcessing}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:h-8 sm:w-8"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assign New Cost Center */}
                  <div className="mt-4 sm:mt-6">
                    <h4 className="mb-3 text-sm font-semibold text-secondary">Asignar Nuevo Centro de Costo</h4>
                    <div className="flex flex-col gap-2 sm:flex-row">
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
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
        <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-3 sm:px-6 sm:py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-border bg-white px-6 py-2 font-semibold text-secondary transition hover:bg-gray-50 sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
