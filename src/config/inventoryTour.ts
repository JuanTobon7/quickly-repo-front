import { driver, DriveStep, Config } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/driver-custom.css";

// Configuración personalizada para el tour (responsive)
export const driverConfig: Config = {
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  progressText: "{{current}} de {{total}}",
  nextBtnText: 'Siguiente',
  prevBtnText: 'Anterior',
  doneBtnText: 'Finalizar',
  popoverClass: 'driverjs-theme',
  popoverOffset: 20,
  overlayOpacity: 0.2,
  smoothScroll: true,
  animate: true,
  allowClose: true,
  stagePadding: 14,
  stageRadius: 8,
  disableActiveInteraction: false,
  allowKeyboardControl: false
};

// Pasos del tour de Inventario
export const inventoryTourSteps: DriveStep[] = [
  {
    element: '.inventory-header',
    popover: {
      title: '¡Bienvenido al Módulo de Inventario!',
      description: 'Aquí puedes buscar, filtrar, crear y editar productos. Te guiaré por todas las funcionalidades disponibles.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-company',
    popover: {
      title: 'Empresa',
      description: 'Filtra productos por empresa. Útil si manejas inventarios de múltiples empresas.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-line',
    popover: {
      title: 'Filtro por Línea de Producto',
      description: 'Filtra tus productos por línea. Por ejemplo: Alimentos, Bebidas, Electrónicos, etc. Esto te ayuda a organizar mejor tu inventario.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-group',
    popover: {
      title: 'Filtro por Grupo',
      description: 'Filtra por tipo de grupo como Materia Prima, Productos Terminados, etc. Esto te permite ver categorías específicas.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-brand',
    popover: {
      title: 'Filtro por Marca',
      description: 'Busca productos de una marca específica. Selecciona de la lista de marcas que has configurado.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-measurement',
    popover: {
      title: 'Filtro por Unidad de Medida',
      description: 'Filtra productos por su unidad de medida: Kilogramos, Litros, Unidades, Paquetes, etc.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-tax',
    popover: {
      title: 'Filtro por Impuesto',
      description: 'Filtra productos según su tipo de impuesto: Exento o IVA 19%. Útil para reportes tributarios.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-barcode',
    popover: {
      title: 'Buscar por Código de Barras',
      description: 'Busca productos usando el código de barras. Puedes escribirlo manualmente o hacer clic en el ícono para escanear con tu cámara.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-code',
    popover: {
      title: 'Buscar por Código',
      description: 'Busca productos por su código interno. Cada producto tiene un código único en tu sistema.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-reference',
    popover: {
      title: 'Buscar por Referencia',
      description: 'Busca productos por referencia. La referencia es un identificador adicional que puedes asignar a tus productos.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.filter-product-name',
    popover: {
      title: 'Buscar por Nombre con Voz 🎤',
      description: 'Busca productos por nombre. ¡Puedes escribir o usar el micrófono para buscar por voz! (Solo en Chrome/Edge)',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.btn-clear-filters',
    popover: {
      title: 'Limpiar Filtros',
      description: 'Elimina todos los filtros aplicados y vuelve a la vista completa del inventario.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.btn-new-product',
    popover: {
      title: 'Crear Nuevo Producto',
      description: 'Haz clic aquí para agregar un nuevo producto a tu inventario. Se abrirá un formulario completo.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.btn-export',
    popover: {
      title: 'Exportar Catálogo',
      description: 'Exporta tu catálogo de productos a Excel o PDF. Ideal para reportes e inventarios físicos.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.btn-print',
    popover: {
      title: 'Imprimir',
      description: 'Imprime tu catálogo de productos. Útil para llevar un control físico del inventario.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.btn-import',
    popover: {
      title: 'Importar Productos',
      description: 'Importa productos masivamente desde un archivo Excel o CSV. Perfecto para migraciones o actualizaciones grandes.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.products-table',
    popover: {
      title: 'Tabla de Productos',
      description: 'Aquí se muestran todos tus productos con información clave: ID, Código de Barras, Nombre, Marca, Línea y más. Haz clic en una fila para editar el producto.',
      side: 'top',
      align: 'center'
    }
  }
];

// Función para iniciar el tour
export const startInventoryTour = () => {
  const driverObj = driver(driverConfig);
  driverObj.setSteps(inventoryTourSteps);
  driverObj.drive();
};
