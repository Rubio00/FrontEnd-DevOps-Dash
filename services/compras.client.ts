import { aCompra } from "@/lib/compra-mapper";
import type { CompraBackend } from "@/lib/compra-mapper";
import { peticion } from "@/lib/cliente";
import type { Compra, NuevaCompra } from "@/types/compra";

export async function crearCompra(datos: NuevaCompra): Promise<Compra> {
  const compra = await peticion<CompraBackend>("/compras", { method: "POST", body: datos });
  return aCompra(compra);
}

