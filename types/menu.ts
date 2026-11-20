import type { Rol } from "@/types/auth";

export type IconoModulo = "inicio" | "ventas" | "inventario" | "compras" | "admin";

export type Modulo = {
  id: string;
  nombre: string;
  descripcion: string;
  href: string;
  etiqueta: string;
  icono: IconoModulo;
  roles: Rol[];
};
