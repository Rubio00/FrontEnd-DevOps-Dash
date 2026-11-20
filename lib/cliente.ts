"use client";

/**
 * Cliente HTTP para componentes de cliente.
 *
 * No conoce la URL del backend ni el token: llama al BFF interno
 * (`/api/backend/...`), que es quien añade el Bearer desde la cookie httpOnly.
 */

export class ErrorPeticion extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ErrorPeticion";
        this.status = status;
    }
}

function mensajeDeError(payload: unknown, fallback: string): string {
    if (!payload || typeof payload !== "object") return fallback;

    const { message, errors } = payload as { message?: unknown; errors?: unknown };

    if (Array.isArray(errors) && errors.length > 0) {
        const textos = errors
            .map((error) => (typeof error === "string" ? error : (error as { message?: string })?.message))
            .filter((texto): texto is string => Boolean(texto));
        if (textos.length > 0) return textos.join(". ");
    }

    return typeof message === "string" && message.trim() ? message : fallback;
}

type Opciones = Omit<RequestInit, "body"> & { body?: unknown };

export async function peticion<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
    const { body, headers, ...rest } = opciones;
    const finalHeaders = new Headers(headers);
    finalHeaders.set("Accept", "application/json");
    if (body !== undefined) finalHeaders.set("Content-Type", "application/json");

    const response = await fetch(`/api/backend/${ruta.replace(/^\/+/, "")}`, {
        ...rest,
        headers: finalHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
    });

    const texto = response.status === 204 ? "" : await response.text();
    let payload: unknown = null;
    if (texto) {
        try {
            payload = JSON.parse(texto);
        } catch {
            payload = texto;
        }
    }

    if (!response.ok) {
        throw new ErrorPeticion(
            response.status,
            mensajeDeError(payload, "No se pudo completar la operación"),
        );
    }

    return payload as T;
}

/** Desenvuelve `{ data }` igual que el helper del servidor. */
export async function peticionData<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
    const payload = await peticion<T | { data: T }>(ruta, opciones);
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
}
