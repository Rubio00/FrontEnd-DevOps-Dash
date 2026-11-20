import "server-only";

import { apiData } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { RolAdmin, UsuarioAdmin } from "@/types/admin";

export async function getUsuarios(): Promise<UsuarioAdmin[]> {
  const token = await getSessionToken();
  return apiData<UsuarioAdmin[]>("/api/v1/usuarios", { token });
}

export async function getRoles(): Promise<RolAdmin[]> {
  const token = await getSessionToken();
  return apiData<RolAdmin[]>("/api/v1/roles", { token });
}
