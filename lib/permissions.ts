import { normalizarRol } from "@/types/auth";

export const routePermissions: Record<string, string[]> = {
    "/inicio": ["admin", "gerente", "cajero", "barista", "compras"],
    "/ventas": ["admin", "gerente", "cajero"],
    "/balance": ["admin", "gerente"],
    "/inventario": ["admin", "gerente", "barista", "compras"],
    "/compras": ["admin", "gerente", "compras"],
    "/proveedores": ["admin", "gerente", "compras"],
    "/planilla": ["admin", "gerente"],
    "/sucursales": ["admin", "gerente"],
    "/admin": ["admin"],
    "/perfil": ["admin", "gerente", "cajero", "barista", "compras"],
};

export function canAccess(pathname: string, role: string) {
    const route = Object.keys(routePermissions).find(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!route) return false;

    return routePermissions[route].includes(normalizarRol(role));
}

