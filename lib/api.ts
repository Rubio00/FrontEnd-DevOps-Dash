import "server-only";

/**
 * Cliente HTTP del servidor (Server Components y Route Handlers).
 *
 * - `API_URL` es una variable de entorno privada: el navegador nunca la ve.
 * - El token JWT vive en una cookie httpOnly y se inyecta como Bearer aquí.
 * - Normaliza los errores del backend (`{ statusCode, message, errors }`).
 */

export const API_URL = (process.env.API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export class ApiError extends Error {
    readonly status: number;
    readonly details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
    token?: string | null;
    body?: unknown;
    /** Tiempo máximo de espera en ms (por defecto 10s). */
    timeout?: number;
};

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

async function parsearCuerpo(response: Response): Promise<unknown> {
    if (response.status === 204) return null;
    const texto = await response.text();
    if (!texto) return null;
    try {
        return JSON.parse(texto);
    } catch {
        return texto;
    }
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
    const { token, body, headers, timeout = 10_000, ...rest } = options;
    const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

    const finalHeaders = new Headers(headers);
    finalHeaders.set("Accept", "application/json");
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
    if (body !== undefined && !finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json");
    }

    let response: Response;
    try {
        response = await fetch(url, {
            ...rest,
            headers: finalHeaders,
            body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
            cache: "no-store",
            signal: AbortSignal.timeout(timeout),
        });
    } catch (error) {
        const motivo = error instanceof Error ? error.message : "Error de red";
        throw new ApiError(503, `No se pudo conectar con la API (${motivo})`);
    }

    if (!response.ok) {
        const payload = await parsearCuerpo(response);
        throw new ApiError(response.status, mensajeDeError(payload, "La API respondió con un error"), payload);
    }

    return response;
}

/** Devuelve el JSON tal cual lo entrega el backend. */
export async function apiJson<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const response = await apiFetch(path, options);
    return (await parsearCuerpo(response)) as T;
}

/**
 * Devuelve el JSON desenvuelto.
 * El backend responde `{ data: ... }` en la mayoría de recursos y arrays planos
 * en otros (compras, ventas, insumos, usuarios, roles), así que cubrimos ambos.
 */
export async function apiData<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const payload = await apiJson<T | { data: T }>(path, options);
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as { data: T }).data;
    }
    return payload as T;
}

