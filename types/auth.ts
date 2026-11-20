export type Rol = "administrador" | "gerente" | "cajero" | "bodega";

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  iniciales: string;
  rol: Rol;
  sucursalId: string;
};

export const roles: Rol[] = ["administrador", "gerente", "cajero", "bodega"];

export const etiquetasRol: Record<Rol, string> = {
  administrador: "Administrador",
  gerente: "Gerente",
  cajero: "Cajero",
  bodega: "Bodega",
};
