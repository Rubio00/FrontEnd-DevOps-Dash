import { proveedores } from "@/data/proveedores";
import type { Proveedor } from "@/types/proveedor";

export async function getProveedores(): Promise<Proveedor[]> {
  return proveedores;
}

export async function crearProveedor(proveedor: Proveedor): Promise<Proveedor> {
  return proveedor;
}