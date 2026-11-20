import { peticionData } from "@/lib/cliente";
import type { DatosSucursal, Sucursal } from "@/types/sucursal";

export async function crearSucursal(datos: DatosSucursal): Promise<Sucursal> {
  return peticionData<Sucursal>("/sucursal", { method: "POST", body: datos });
}

export async function actualizarSucursal(id: number, cambios: Partial<DatosSucursal>): Promise<Sucursal> {
  return peticionData<Sucursal>(`/sucursal/${id}`, { method: "PATCH", body: cambios });
}
