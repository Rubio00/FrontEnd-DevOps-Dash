import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, apiData } from "@/lib/api";

export const COOKIE_SESION = "session";

export type SessionUser = {
    id: number;
    email: string;
    activo: boolean;
    rolId: number | null;
    sucursalId: number | null;
    rol: { id: number; nombre: string; descripcion?: string | null } | null;
    sucursal: { id: number; nombre: string; direccion?: string | null } | null;
    empleado: { id: number; nombres: string; apellidos: string; puesto: string } | null;
};

export async function getSessionToken(): Promise<string | null> {
    return (await cookies()).get(COOKIE_SESION)?.value ?? null;
}

/** Devuelve el usuario autenticado o `null` si no hay sesión válida. */
export async function getSessionUser(): Promise<SessionUser | null> {
    const token = await getSessionToken();
    if (!token) return null;

    try {
        return await apiData<SessionUser>("/api/v1/auth/me", { token });
    } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            return null;
        }
        throw error;
    }
}

/** Igual que `getSessionUser`, pero redirige al login si no hay sesión. */
export async function requireSessionUser(): Promise<SessionUser> {
    const user = await getSessionUser();
    if (!user || !user.activo) redirect("/login");
    return user;
}

export function nombreCompleto(user: SessionUser | null): string {
    if (!user) return "Sin sesión";
    if (user.empleado) return `${user.empleado.nombres} ${user.empleado.apellidos}`.trim();
    return user.email;
}

