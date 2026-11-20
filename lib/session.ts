
import "server-only";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";

export type SessionUser = {
    id: number;
    email: string;
    activo: boolean;
    rol: {
        id: number;
        nombre: string;
    } | null;
    sucursal: {
        id: number;
        nombre: string;
    } | null;
    empleado: {
        nombres: string;
        apellidos: string;
        puesto: string;
    } | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
    const token = (await cookies()).get("session")?.value;

    if (!token) return null;

    const response = await apiFetch("/api/v1/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401 || response.status === 403) {
        return null;
    }

    if (!response.ok) {
        throw new Error("No se pudo verificar la sesión");
    }

    const result = await response.json();

    return result.data;
}
