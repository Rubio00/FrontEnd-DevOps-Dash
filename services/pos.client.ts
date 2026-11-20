import { peticionData } from "@/lib/cliente";
import type { CajaPos, ClientePos, DatosCliente, NuevaVenta } from "@/types/pos";

type CajaBackend = Omit<
  CajaPos,
  "montoInicial" | "efectivoEsperado" | "efectivoReal" | "diferencia"
> & {
  montoInicial: string;
  efectivoEsperado: string | null;
  efectivoReal: string | null;
  diferencia: string | null;
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

export async function abrirCaja(datos: {
  sucursalId: number;
  usuarioId: number;
  turno: "manana" | "tarde" | "noche";
  montoInicial: number;
}): Promise<CajaPos> {
  const caja = await peticionData<CajaBackend>("/caja/abrir", { method: "POST", body: datos });
  return aCaja(caja);
}

export async function cerrarCaja(
  id: number,
  datos: { efectivoReal: number; observaciones?: string },
): Promise<CajaPos> {
  const caja = await peticionData<CajaBackend>(`/caja/${id}/cerrar`, { method: "POST", body: datos });
  return aCaja(caja);
}

export async function crearCliente(datos: DatosCliente): Promise<ClientePos> {
  return peticionData<ClientePos>("/clientes", { method: "POST", body: datos });
}

type VentaCreada = {
  id: number;
  tipoDoc: "FCF" | "CCF";
  serie: string;
  numeroDoc: number;
  total: string;
};

export async function registrarVenta(datos: NuevaVenta): Promise<VentaCreada> {
  return peticionData<VentaCreada>("/ventas", { method: "POST", body: datos });
}
