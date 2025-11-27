import { driver, DriveStep, Config } from "driver.js";
import "driver.js/dist/driver.css";
import "../styles/driver-custom.css";
import { driverConfig } from "./inventoryTour";

export const postPageTourSteps: DriveStep[] = [
  {
    element: ".pos-page",
    popover: {
      title: "Punto de Venta",
      description:
        "Este es el módulo principal para trabajar ventas y cotizaciones. El recorrido te va a mostrar cada sección de arriba hacia abajo.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: ".search-element",
    popover: {
      title: "Búsqueda de productos",
      description:
        "Acá hacés las búsquedas inteligentes de productos. También podés abrir y cerrar el modo de búsqueda con CTRL + Enter. Cuando está activo, el foco queda listo para escribir sin usar el mouse.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: ".datatable-element",
    popover: {
      title: "Listado de productos",
      description:
        "Este listado muestra los resultados paginados que envia el servidor. Podés avanzar o retroceder de página usando el paginador. Si activás la navegación por teclado con CTRL + ← vas a poder moverte por las páginas con ← → y navegar entre productos con ↑ ↓ y  seleccionarlos con Enter.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: ".invoice-element",
    popover: {
      title: "Facturación",
      description:
        "Acá ves los productos que vas agregando a la factura. Al activar la navegación con CTRL + → podés subir y bajar con ↑ ↓, modificar cantidades con + y -, y confirmar la factura con Enter.",
      side: "bottom",
      align: "start",
    },
  },
];

export const startPosPageTour = () => {
  const driverObj = driver(driverConfig);
  driverObj.setSteps(postPageTourSteps);
  driverObj.drive();
};
