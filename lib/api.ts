
export const API_URL = "http://localhost:3000";

if (!API_URL) {
    throw new Error("Falta configurar API_URL");
}

export async function apiFetch(
    path: string,
    options: RequestInit = {}
) {
    return fetch(`${API_URL}${path}`, {
        ...options,
        cache: "no-store",
    });
}
