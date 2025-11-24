import { driver, DriveStep, Config } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/driver-custom.css";

// Configuración personalizada para el tour
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

// Pasos del tour
export const parametersTourSteps: DriveStep[] = [
  {
    element: '.parameters-header',
    popover: {
      title: 'Bienvenido a Parámetros de Inventario',
      description: 'Aquí puedes configurar todos los aspectos importantes de tu sistema de inventarios. Te guiaré paso a paso.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.valuation-method',
    popover: {
      title: 'Método de Valoración',
      description: 'Selecciona cómo se calculará el valor de tu inventario. Promedio ponderado es el más común y recomendado para la mayoría de negocios.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.price-rounding',
    popover: {
      title: 'Redondeo de Precios',
      description: 'Define cómo se redondearán los precios. Por ejemplo, "100 / 500" redondeará a múltiplos de 100 o 500.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.minimum-profit',
    popover: {
      title: 'Utilidad Mínima',
      description: 'Establece el porcentaje mínimo de ganancia que deseas obtener en tus productos. Esto ayuda a mantener la rentabilidad.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.auto-code-checkbox',
    popover: {
      title: 'Código Automático',
      description: 'Si activas esta opción, el sistema generará automáticamente códigos únicos para cada producto.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.negative-stock-checkbox',
    popover: {
      title: 'Stock Negativo',
      description: 'Permite ventas incluso cuando no hay stock disponible. Útil para negocios que trabajan bajo pedido.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.min-stock',
    popover: {
      title: 'Stock Mínimo',
      description: 'Define la cantidad mínima de productos en inventario antes de recibir una alerta. Te ayuda a mantener stock suficiente.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.max-stock',
    popover: {
      title: 'Stock Máximo',
      description: 'Define la cantidad máxima recomendada de productos. Útil para evitar sobrestock y optimizar el espacio.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.low-stock-alert',
    popover: {
      title: 'Alertas de Stock Bajo',
      description: 'Recibe notificaciones cuando los productos estén por debajo del stock mínimo configurado.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.expiration-alert',
    popover: {
      title: 'Alertas de Vencimiento',
      description: 'Activa alertas para productos próximos a vencer. Importante para productos perecederos.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '.brand-section',
    popover: {
      title: 'Gestión de Marcas',
      description: 'Aquí puedes agregar, editar y eliminar las marcas de productos que manejas en tu inventario.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '.product-line-section',
    popover: {
      title: 'Gestión de Linea de Productos',
      description: 'Organiza tus productos por su linea para una mejor gestión y búsqueda en el inventario.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '.supplier-section',
    popover: {
      title: 'Gestión de Proveedores',
      description: 'Administra la información de tus proveedores. Mantén un registro completo de contactos y condiciones comerciales.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '.group-type-section',
    popover: {
      title: 'Tipos de Grupo',
      description: 'Clasifica tus productos por tipos de grupo como Materia Prima, Productos Procesados, Productos Terminados, etc. Esto te ayuda a organizar mejor tu inventario.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '.unit-measure-section',
    popover: {
      title: 'Unidades de Medida',
      description: 'Define las unidades de medida que usarás en tu inventario: Kilogramos (kg), Litros (l), Unidades (ud), Paquetes (paq), etc.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '.tax-section',
    popover: {
      title: 'Gestión de Impuestos',
      description: 'Configura los impuestos aplicables a tus productos. Define la tasa de cada impuesto y especifica si se aplican a ventas o compras. Esto te permite calcular automáticamente los precios con impuestos incluidos.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '.price-scale-section',
    popover: {
      title: 'Nombres de Niveles de Precio',
      description: 'Personaliza los nombres de tus niveles de precio (escalas). Por ejemplo: "Mayorista", "Minorista", "Distribuidor", "Cliente VIP", etc. Estos nombres aparecerán en el formulario de productos cuando configures los diferentes precios de venta.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '.save-button',
    popover: {
      title: '¡Guarda tus Cambios!',
      description: 'No olvides guardar los cambios después de configurar los parámetros. Los cambios no se aplicarán hasta que hagas clic aquí.',
      side: 'top',
      align: 'end'
    }
  }
];

// Función para iniciar el tour
export const startParametersTour = () => {
  const driverObj = driver(driverConfig);
  driverObj.setSteps(parametersTourSteps);
  driverObj.drive();
};
