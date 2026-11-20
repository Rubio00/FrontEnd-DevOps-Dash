import "server-only";

import { ApiError, apiData } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { CajaPos, ClientePos, MetodoPago, ProductoPos, VentaResumen } from "@/types/pos";

type ProductoBackend = {
  id: number;
  nombre: string;
  categoria: string | null;
  tipo: "elaborado" | "reventa";
  precio: string;
  activo: boolean;
};

type CajaBackend = Omit<
  CajaPos,
  "montoInicial" | "efectivoEsperado" | "efectivoReal" | "diferencia"
> & {
  montoInicial: string;
  efectivoEsperado: string | null;
  efectivoReal: string | null;
  diferencia: string | null;
};

type VentaBackend = {
  id: number;
  fecha: string;
  tipoDoc: "FCF" | "CCF";
  serie: string;
  numeroDoc: number;
  total: string;
  estado: string;
  cliente: { id: number; nombre: string } | null;
};

function aCaja(caja: CajaBackend): CajaPos {
  return {
    ...caja,
    montoInicial: Number(caja.montoInicial),
    efectivoEsperado: caja.efectivoEsperado === null ? null : Number(caja.efectivoEsperado),
    efectivoReal: caja.efectivoReal === null ? null : Number(caja.efectivoReal),
    diferencia: caja.diferencia === null ? null : Number(caja.diferencia),
  };
}

export async function getCatalogoPos(): Promise<ProductoPos[]> {
  const token = await getSessionToken();
  const productos = await apiData<ProductoBackend[]>("/api/v1/producto?activo=true", { token });
  return productos.map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    categoria: producto.categoria,
    tipo: producto.tipo,
    precio: Number(producto.precio),
  }));
}

export async function getClientesPos(): Promise<ClientePos[]> {
  const token = await getSessionToken();
  return apiData<ClientePos[]>("/api/v1/clientes", { token });
}

export async function getMetodosPago(): Promise<MetodoPago[]> {
  const token = await getSessionToken();
  return apiData<MetodoPago[]>("/api/v1/metodos-pago", { token });
}

export async function getCajaAbierta(sucursalId: number): Promise<CajaPos | null> {
  const token = await getSessionToken();
  try {
    const caja = await apiData<CajaBackend>(`/api/v1/caja/sucursal/${sucursalId}/abierta`, { token });
    return aCaja(caja);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getVentasRecientes(sucursalId: number): Promise<VentaResumen[]> {
  const token = await getSessionToken();
  const ventas = await apiData<VentaBackend[]>(`/api/v1/ventas?sucursalId=${sucursalId}&limit=10`, { token });
  return ventas.map((venta) => ({ ...venta, total: Number(venta.total) }));
}
