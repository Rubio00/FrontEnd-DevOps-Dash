import "server-only";

import { apiData } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { Proveedor } from "@/types/proveedor";

export async function getProveedores(): Promise<Proveedor[]> {
  const token = await getSessionToken();
  return apiData<Proveedor[]>("/api/v1/proveedor", { token });
}
