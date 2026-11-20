import type { Modulo } from "@/types/menu";

/**
 * Definición del menú principal. Cada módulo declara los roles que pueden
 * verlo; el filtrado real vive en `lib/permissions.ts`.
 */
export const modulos: Modulo[] = [
  {
    id: "inicio",
    nombre: "Inicio",
    descripcion: "Panel general con el estado de la operación y accesos rápidos.",
    href: "/inicio",
    etiqueta: "Panel",
    icono: "inicio",
    roles: ["admin", "gerente", "cajero", "barista", "compras"],
  },
  {
    id: "ventas",
    nombre: "Ventas",
    descripcion: "Punto de venta, pedidos del día y cierre de caja.",
    href: "/ventas",
    etiqueta: "POS",
    icono: "ventas",
    roles: ["admin", "gerente", "cajero"],
  },
  {
    id: "inventario",
    nombre: "Inventario",
    descripcion: "Existencias, recetas, productos y movimientos por sucursal.",
    href: "/inventario",
    etiqueta: "Stock",
    icono: "inventario",
    roles: ["admin", "gerente", "barista", "compras"],
  },
  {
    id: "compras",
    nombre: "Compras",
    descripcion: "Facturas de proveedores, cuentas por pagar y reposición.",
    href: "/compras",
    etiqueta: "Compras",
    icono: "compras",
    roles: ["admin", "gerente", "compras"],
  },
  {
    id: "admin",
    nombre: "Administración",
    descripcion: "Usuarios, roles, sucursales y configuración del sistema.",
    href: "/admin",
    etiqueta: "Sistema",
    icono: "admin",
    roles: ["admin"],
  },
];

