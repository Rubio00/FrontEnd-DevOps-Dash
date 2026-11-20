import "server-only";

import { aCompra } from "@/lib/compra-mapper";
import type { CompraBackend } from "@/lib/compra-mapper";
import { apiData } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { Compra, InsumoCompra } from "@/types/compra";

type InsumoBackend = {
  id: number;
  nombre: string;
  unidad: string;
  costoPromedio: string;
  activo: boolean;
};

export async function getCompras(): Promise<Compra[]> {
  const token = await getSessionToken();
  const compras = await apiData<CompraBackend[]>("/api/v1/compras", { token });
  return compras.map(aCompra);
}

export async function getInsumos(): Promise<InsumoCompra[]> {
  const token = await getSessionToken();
  const insumos = await apiData<InsumoBackend[]>("/api/v1/insumos", { token });
  return insumos
    .filter((insumo) => insumo.activo)
    .map((insumo) => ({
      id: insumo.id,
      nombre: insumo.nombre,
      unidad: insumo.unidad,
      costo: Number(insumo.costoPromedio),
    }));
}

