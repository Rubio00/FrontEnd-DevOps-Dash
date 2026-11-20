
export const routePermissions: Record<string, string[]> = {
    "/inicio": ["admin", "gerente", "cajero", "bodega"],
    "/ventas": ["admin", "gerente", "cajero"],
    "/balance": ["admin", "gerente"],
    "/inventario": ["admin", "gerente", "bodega"],
    "/compras": ["admin", "gerente", "bodega"],
    "/proveedores": ["admin", "gerente"],
    "/planilla": ["admin", "gerente"],
    "/sucursales": ["admin", "gerente"],
    "/admin": ["admin"],
    "/perfil": ["admin", "gerente", "cajero", "bodega"],
};

export function normalizeRole(role: string) {
    const normalized = role.toLowerCase().trim();
    return normalized === "administrador"
        ? "admin"
        : normalized;
}

export function canAccess(pathname: string, role: string) {
    const route = Object.keys(routePermissions).find(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (!route) return false;

    return routePermissions[route].includes(normalizeRole(role));
}
