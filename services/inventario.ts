import "server-only";

import { apiData } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type {
  Categoria,
  Insumo,
  MovimientoStock,
  ProductoInventario,
  StockSucursal,
} from "@/types/inventario";

type InsumoBackend = Omit<Insumo, "costoPromedio"> & { costoPromedio: string };

type StockBackend = Omit<StockSucursal, "stockActual" | "stockMinimo" | "insumo"> & {
  stockActual: string;
  stockMinimo: string;
  insumo: InsumoBackend | null;
};

type ProductoBackend = Omit<ProductoInventario, "precio" | "insumo" | "receta"> & {
  precio: string;
  insumo: { id: number; nombre: string; unidad: string; costoPromedio: string } | null;
  receta?: {
    id: number;
    productoId: number;
    insumoId: number;
    cantidad: string;
    insumo: { id: number; nombre: string; unidad: string; costoPromedio: string };
  }[];
};

type MovimientoBackend = Omit<MovimientoStock, "cantidad"> & { cantidad: string };

export function aInsumo(insumo: InsumoBackend): Insumo {
  return {
    ...insumo,
    costoPromedio: Number(insumo.costoPromedio),
    proveedores: insumo.proveedores ?? [],
  };
}

export async function getStock(): Promise<StockSucursal[]> {
  const token = await getSessionToken();
  const filas = await apiData<StockBackend[]>("/api/v1/inventario", { token });

  return filas.map((fila) => ({
    ...fila,
    stockActual: Number(fila.stockActual),
    stockMinimo: Number(fila.stockMinimo),
    insumo: fila.insumo ? aInsumo(fila.insumo) : null,
  }));
}

export async function getMovimientos(): Promise<MovimientoStock[]> {
  const token = await getSessionToken();
  const filas = await apiData<MovimientoBackend[]>("/api/v1/inventario/movimientos", { token });
  return filas.map((fila) => ({ ...fila, cantidad: Number(fila.cantidad) }));
}

export async function getCatalogoInsumos(): Promise<Insumo[]> {
  const token = await getSessionToken();
  const filas = await apiData<InsumoBackend[]>("/api/v1/insumos", { token });
  return filas.map(aInsumo);
}

export async function getProductosInventario(): Promise<ProductoInventario[]> {
  const token = await getSessionToken();
  const filas = await apiData<ProductoBackend[]>("/api/v1/producto", { token });

  return filas.map((fila) => ({
    ...fila,
    precio: Number(fila.precio),
    insumo: fila.insumo ? { ...fila.insumo, costoPromedio: Number(fila.insumo.costoPromedio) } : null,
    receta: (fila.receta ?? []).map((item) => ({
      ...item,
      cantidad: Number(item.cantidad),
      insumo: { ...item.insumo, costoPromedio: Number(item.insumo.costoPromedio) },
    })),
  }));
}

export async function getCategorias(): Promise<Categoria[]> {
  const token = await getSessionToken();
  return apiData<Categoria[]>("/api/v1/categorias", { token });
}
