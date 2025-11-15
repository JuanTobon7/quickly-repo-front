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
};

// Pasos del tour de Formulario de Producto (en orden visual de la página)
export const productFormTourSteps: DriveStep[] = [
  {
    element: '.product-form-header',
    popover: {
      title: '¡Bienvenido al Formulario de Productos!',
      description: 'Aquí puedes crear o editar productos de tu inventario. Te guiaré por todos los campos en orden de arriba hacia abajo.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.btn-cancel-product',
    popover: {
      title: 'Botón Cancelar',
      description: 'Si deseas descartar los cambios y volver al inventario, haz clic en este botón.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.btn-save-product',
    popover: {
      title: 'Botón Guardar',
      description: 'Una vez completados todos los campos, haz clic aquí para guardar el producto en tu inventario.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-code',
    popover: {
      title: 'Código Interno',
      description: 'Código único de tu producto en el sistema. Puede ser generado automáticamente o ingresado manualmente según tu configuración.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-reference',
    popover: {
      title: 'Referencia',
      description: 'Referencia adicional del producto. Puede ser el código del proveedor, modelo, o cualquier identificador alternativo.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-name',
    popover: {
      title: 'Nombre del Producto',
      description: 'Ingresa el nombre completo del producto. Sé descriptivo para facilitar las búsquedas.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-description',
    popover: {
      title: 'Descripción',
      description: 'Describe tu producto en detalle. Incluye características importantes, especificaciones, o cualquier información relevante.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-group',
    popover: {
      title: 'Grupo de Producto',
      description: 'Selecciona el grupo al que pertenece (ej: Materia Prima, Productos Terminados). Esto ayuda a clasificar tu inventario.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-line',
    popover: {
      title: 'Línea de Producto',
      description: 'Selecciona la línea a la que pertenece este producto (ej: Alimentos, Bebidas, Limpieza). Organiza mejor tu inventario.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-measurement',
    popover: {
      title: 'Unidad de Medida',
      description: 'Define cómo se mide este producto: Kilogramos (kg), Litros (l), Unidades (ud), Paquetes (paq), etc.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-brand',
    popover: {
      title: 'Marca',
      description: 'Selecciona la marca del producto. Si no existe, puedes crearla en la sección de Parámetros.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.product-barcode',
    popover: {
      title: 'Código de Barras',
      description: 'Ingresa el código de barras del producto. Puedes escribirlo manualmente o hacer clic en el ícono para escanearlo con tu cámara.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.product-image-section',
    popover: {
      title: 'Imagen del Producto',
      description: 'Carga una imagen de tu producto haciendo clic o arrastrándola aquí. El sistema procesará automáticamente la imagen para mejorar su calidad, eliminar fondos y optimizar el tamaño. Podrás ver una comparación antes de confirmar.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.product-tax-section',
    popover: {
      title: 'Configuración de Impuestos',
      description: 'Configura el precio base del producto y los impuestos aplicables. Puedes indicar si el precio ya incluye impuestos o no. El sistema calculará automáticamente el precio antes y después de impuestos según tu configuración.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.product-rounding-checkbox',
    popover: {
      title: 'Redondeo de Precios',
      description: 'Activa esta opción para redondear los precios de venta según la configuración global (ej: múltiplos de 100, 500, 1000).',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.price-scale-table',
    popover: {
      title: 'Escala de Precios',
      description: 'Define diferentes precios según el tipo de cliente. Ajusta el nombre del nivel, porcentaje de utilidad y verás el precio calculado automáticamente.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '.price-level-name',
    popover: {
      title: 'Nombre del Nivel',
      description: 'Personaliza el nombre de cada nivel de precio (ej: Mayorista, Minorista, Distribuidor). Haz clic para editar.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.price-profit-percentage',
    popover: {
      title: 'Porcentaje de Utilidad',
      description: 'Define el porcentaje de ganancia para este nivel. El sistema calculará automáticamente el precio de venta basado en el costo.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '.price-sale-price',
    popover: {
      title: 'Precio de Venta Calculado',
      description: 'Este es el precio final calculado automáticamente. Se actualiza al cambiar el costo o el porcentaje de utilidad. Incluye redondeo si está activado.',
      side: 'top',
      align: 'start'
    }
  }
];

// Función para iniciar el tour
export const startProductFormTour = () => {
  const driverObj = driver(driverConfig);
  driverObj.setSteps(productFormTourSteps);
  driverObj.drive();
};
