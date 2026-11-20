export type Rol = "admin" | "gerente" | "cajero" | "barista" | "compras";

/** Alias históricos que puede devolver el backend o usar la UI. */
const ALIAS_ROL: Record<string, Rol> = {
    admin: "admin",
    administrador: "admin",
    gerente: "gerente",
    cajero: "cajero",
    barista: "barista",
    compras: "compras",
    comprador: "compras",
    bodega: "compras",
    inventario: "compras",
};

export function normalizarRol(rol: string | null | undefined): Rol {
    const clave = (rol ?? "").toLowerCase().trim();
    return ALIAS_ROL[clave] ?? "cajero";
}

export const roles: Rol[] = ["admin", "gerente", "cajero", "barista", "compras"];

export const etiquetasRol: Record<string, string> = {
    admin: "Administrador",
    gerente: "Gerente",
    cajero: "Cajero",
    barista: "Barista",
    compras: "Compras",
};

export function etiquetaRol(rol: string | null | undefined): string {
    return etiquetasRol[normalizarRol(rol)];
}

export function inicialesDe(nombre: string): string {
    return nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() ?? "")
        .join("");
}

/** Datos de sesión listos para componentes de cliente. */
export type UsuarioSesion = {
    id: number;
    email: string;
    nombre: string;
    iniciales: string;
    rol: Rol;
    cargo: string;
    sucursal: string | null;
};


