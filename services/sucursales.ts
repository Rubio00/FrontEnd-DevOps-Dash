import "server-only";

import { apiData } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { Sucursal } from "@/types/sucursal";

export async function getSucursales(): Promise<Sucursal[]> {
  const token = await getSessionToken();
  return apiData<Sucursal[]>("/api/v1/sucursal", { token });
}

export async function getSucursalPorId(id: string | number): Promise<Sucursal | null> {
  const token = await getSessionToken();
  try {
    return await apiData<Sucursal>(`/api/v1/sucursal/${id}`, { token });
  } catch {
    return null;
  }
}
