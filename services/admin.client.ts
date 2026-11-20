import { peticionData } from "@/lib/cliente";
import type { DatosUsuario, RolAdmin, UsuarioAdmin } from "@/types/admin";

export async function crearUsuario(datos: DatosUsuario): Promise<UsuarioAdmin> {
  return peticionData<UsuarioAdmin>("/usuarios", { method: "POST", body: datos });
}

export async function actualizarUsuario(
  id: number,
  cambios: Partial<DatosUsuario>,
): Promise<UsuarioAdmin> {
  return peticionData<UsuarioAdmin>(`/usuarios/${id}`, { method: "PATCH", body: cambios });
}

export async function crearRol(nombre: string): Promise<RolAdmin> {
  return peticionData<RolAdmin>("/roles", { method: "POST", body: { nombre } });
}

export async function actualizarRol(id: number, nombre: string): Promise<RolAdmin> {
  return peticionData<RolAdmin>(`/roles/${id}`, { method: "PATCH", body: { nombre } });
}
