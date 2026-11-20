"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { InsumoCompra, NuevaCompra } from "@/types/compra";
import { IVA } from "@/lib/compras";
import { usd } from "@/lib/format";

type LineaForm = { insumoId: number | ""; cantidad: number; costoUnitario: number };
const lineaVacia: LineaForm = { insumoId: "", cantidad: 1, costoUnitario: 0 };

const campo =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

const redondear = (n: number) => Math.round(n * 100) / 100;

type Props = {
  sucursales: { id: number; nombre: string }[];
  proveedores: { id: number; nombre: string }[];
  catalogo: InsumoCompra[];
  onCerrar: () => void;
  onGuardar: (compra: NuevaCompra) => Promise<void>;
};

export default function NuevaCompraModal({ sucursales, proveedores, catalogo, onCerrar, onGuardar }: Props) {
  const [sucursalId, setSucursalId] = useState<number | "">(sucursales[0]?.id ?? "");
  const [proveedorId, setProveedorId] = useState<number | "">(proveedores[0]?.id ?? "");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [tipoPago, setTipoPago] = useState<"contado" | "credito">("contado");
  const [lineas, setLineas] = useState<LineaForm[]>([{ ...lineaVacia }]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cambiar = (i: number, cambios: Partial<LineaForm>) =>
    setLineas((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...cambios } : l)));

  const elegirInsumo = (i: number, id: string) => {
    const insumo = catalogo.find((c) => c.id === Number(id));
    cambiar(i, { insumoId: insumo?.id ?? "", costoUnitario: insumo?.costo ?? 0 });
  };

  const validas = lineas
    .filter((l): l is LineaForm & { insumoId: number } => l.insumoId !== "" && l.cantidad > 0)
    .map((l) => {
      const insumo = catalogo.find((c) => c.id === l.insumoId)!;
      return {
        insumoId: l.insumoId,
        nombre: insumo.nombre,
        unidad: insumo.unidad,
        cantidad: l.cantidad,
        costoUnitario: l.costoUnitario,
        subtotal: redondear(l.cantidad * l.costoUnitario),
      };
    });

  const subtotal = redondear(validas.reduce((s, l) => s + l.subtotal, 0));
  const iva = redondear(subtotal * IVA);
  const total = redondear(subtotal + iva);
  const puedeGuardar = sucursalId !== "" && proveedorId !== "" && numeroFactura.trim() !== "" && validas.length > 0;

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!puedeGuardar) return;
    setError("");
    setGuardando(true);
    try {
      await onGuardar({
        sucursalId: Number(sucursalId),
        proveedorId: Number(proveedorId),
        numeroFactura: numeroFactura.trim(),
        fecha,
        tipoPago,
        subtotal,
        iva,
        total,
        detalles: validas.map((l) => ({
          insumoId: l.insumoId,
          cantidad: l.cantidad,
          costoUnitario: l.costoUnitario,
          subtotal: l.subtotal,
        })),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar la compra.");
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={guardar} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Nueva factura de compra</h2>
          <button type="button" onClick={onCerrar} className="text-stone-400 hover:text-stone-700">
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Sucursal</span>
            <select className={campo} value={sucursalId} onChange={(e) => setSucursalId(Number(e.target.value))}>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Proveedor</span>
            <select className={campo} value={proveedorId} onChange={(e) => setProveedorId(Number(e.target.value))}>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Número de factura</span>
            <input className={campo} value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} required maxLength={40} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Fecha</span>
            <input type="date" className={campo} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Tipo de pago</span>
            <select className={campo} value={tipoPago} onChange={(e) => setTipoPago(e.target.value as "contado" | "credito")}>
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
            </select>
          </label>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Insumos</p>
          {lineas.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_110px_32px] items-end gap-2">
              <select className={campo} value={l.insumoId} onChange={(e) => elegirInsumo(i, e.target.value)}>
                <option value="">Selecciona un insumo...</option>
                {catalogo
                  .filter((c) => c.id === l.insumoId || !lineas.some((x) => x.insumoId === c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.unidad})
                    </option>
                  ))}
              </select>
              <input
                type="number"
                min={0.001}
                step="0.001"
                className={campo}
                value={l.cantidad}
                onChange={(e) => cambiar(i, { cantidad: Number(e.target.value) })}
                aria-label="Cantidad"
              />
              <input
                type="number"
                readOnly
                className={`${campo} bg-stone-100 text-stone-500`}
                value={l.costoUnitario}
                aria-label="Costo unitario"
              />
              {lineas.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setLineas((p) => p.filter((_, idx) => idx !== i))}
                  className="text-stone-400 hover:text-red-600"
                  aria-label="Quitar insumo"
                >
                  ✕
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLineas((p) => [...p, { ...lineaVacia }])}
          className="mt-3 text-sm font-medium text-accent hover:underline"
        >
          + Agregar insumo
        </button>

        <dl className="mt-6 space-y-1 border-t border-stone-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Subtotal</dt>
            <dd>{usd(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">IVA (13%)</dt>
            <dd>{usd(iva)}</dd>
          </div>
          <div className="flex justify-between text-lg font-bold text-primary">
            <dt>Total</dt>
            <dd>{usd(total)}</dd>
          </div>
        </dl>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCerrar} className="rounded-lg border border-stone-300 px-5 py-2 text-sm text-stone-600">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!puedeGuardar || guardando}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {guardando ? "Registrando..." : "Registrar compra"}
          </button>
        </div>
      </form>
    </div>
  );
}
