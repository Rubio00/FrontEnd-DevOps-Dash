import { compras } from "@/data/compras";
import type { Compra } from "@/types/compra";

export async function getCompras(): Promise<Compra[]> {
  return compras;
}
 
export async function crearCompra(compra: Compra): Promise<Compra> {
  return compra;
}