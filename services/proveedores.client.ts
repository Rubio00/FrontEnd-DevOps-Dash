import { peticionData } from "@/lib/cliente";
import type { DatosProveedor, Proveedor } from "@/types/proveedor";

export async function crearProveedor(datos: DatosProveedor): Promise<Proveedor> {
  return peticionData<Proveedor>("/proveedor", { method: "POST", body: datos });
}

export async function actualizarProveedor(id: number, cambios: Partial<DatosProveedor>): Promise<Proveedor> {
  return peticionData<Proveedor>(`/proveedor/${id}`, { method: "PATCH", body: cambios });
}
