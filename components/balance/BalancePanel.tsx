"use client";

import { useMemo, useState } from "react";
import { calcularBalance, filtrarVentas } from "@/lib/balance";
import { FECHA_REFERENCIA, formatearFecha } from "@/lib/fechas";
import type { MetodoPago, Periodo, VentaBalance } from "@/types/balance";

type Props = {
  ventas: VentaBalance[];
  sucursales: { id: string; nombre: string }[];
};

const moneda = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });

const periodos: { id: Periodo; etiqueta: string }[] = [
  { id: "hoy", etiqueta: "Hoy" },
  { id: "7d", etiqueta: "7 días" },
  { id: "30d", etiqueta: "30 días" },
];

const etiquetasMetodo: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};

function Barra({ valor, maximo }: { valor: number; maximo: number }) {
  const ancho = maximo > 0 ? Math.max(2, (valor / maximo) * 100) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-primary/10">
      <div className="h-full rounded-full bg-accent" style={{ width: `${ancho}%` }} />
    </div>
  );
}

export default function BalancePanel({ ventas, sucursales }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>("7d");
  const [sucursalId, setSucursalId] = useState("todas");

  const resumen = useMemo(
    () => calcularBalance(filtrarVentas(ventas, periodo, sucursalId), periodo),
    [ventas, periodo, sucursalId],
  );

  const nombreSucursal = (id: string) => sucursales.find((s) => s.id === id)?.nombre ?? id;
  const maxDia = Math.max(0, ...resumen.porDia.map((d) => d.total));
  const maxMetodo = Math.max(0, ...resumen.porMetodo.map((m) => m.total));
  const maxSucursal = Math.max(0, ...resumen.porSucursal.map((s) => s.total));

  const kpis = [
    { etiqueta: "Total vendido", valor: moneda.format(resumen.total), detalle: "Ventas del período" },
    { etiqueta: "Órdenes", valor: resumen.ordenes.toLocaleString("es-SV"), detalle: "Ventas registradas" },
    { etiqueta: "Ticket promedio", valor: moneda.format(resumen.ticketPromedio), detalle: "Por orden" },
    { etiqueta: "Créditos fiscales", valor: resumen.ccf.toLocaleString("es-SV"), detalle: "Documentos CCF emitidos" },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Resultados</p>
          <h2 className="mt-2 text-2xl font-bold">Balance de ventas</h2>
          <p className="mt-1 text-sm text-muted">Datos simulados al {formatearFecha(FECHA_REFERENCIA)}.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            {periodos.map((p) => (
              <button
                key={p.id}
                aria-pressed={periodo === p.id}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent ${
                  periodo === p.id
                    ? "border-primary bg-primary text-white"
                    : "border-primary/15 bg-white text-primary hover:bg-page"
                }`}
                onClick={() => setPeriodo(p.id)}
                type="button"
              >
                {p.etiqueta}
              </button>
            ))}
          </div>
          <select
            aria-label="Filtrar por sucursal"
            className="rounded-xl border border-primary/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            onChange={(e) => setSucursalId(e.target.value)}
            value={sucursalId}
          >
            <option value="todas">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <section aria-label="Indicadores" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.etiqueta} className="rounded-2xl border border-primary/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-ink/55">{kpi.etiqueta}</p>
            <p className="mt-2 text-3xl font-extrabold text-primary">{kpi.valor}</p>
            <p className="mt-3 text-xs font-medium text-ink/45">{kpi.detalle}</p>
          </article>
        ))}
      </section>

      {resumen.ordenes === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white py-14 text-center text-sm text-muted">
          No hay ventas para este período y sucursal.
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Ventas por día</h3>
            <div className="mt-5 flex h-44 items-end gap-1">
              {resumen.porDia.map((dia) => (
                <div key={dia.fecha} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-t-md bg-accent transition hover:bg-primary"
                    style={{ height: `${maxDia > 0 ? Math.max(2, (dia.total / maxDia) * 100) : 0}%` }}
                    title={`${formatearFecha(dia.fecha)} · ${moneda.format(dia.total)}`}
                  />
                  <span className="text-[10px] font-medium text-ink/45">{dia.fecha.slice(8)}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Método de pago</h3>
              <ul className="mt-4 space-y-4">
                {resumen.porMetodo.map((m) => (
                  <li key={m.metodo}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-primary">{etiquetasMetodo[m.metodo]}</span>
                      <span className="text-ink/60">
                        {moneda.format(m.total)} · {resumen.total > 0 ? Math.round((m.total / resumen.total) * 100) : 0}%
                      </span>
                    </div>
                    <Barra valor={m.total} maximo={maxMetodo} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Por sucursal</h3>
              <ul className="mt-4 space-y-4">
                {resumen.porSucursal.map((s) => (
                  <li key={s.sucursalId}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-primary">{nombreSucursal(s.sucursalId)}</span>
                      <span className="text-ink/60">{moneda.format(s.total)}</span>
                    </div>
                    <Barra valor={s.total} maximo={maxSucursal} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Más vendidos</h3>
              <ol className="mt-4 divide-y divide-primary/8">
                {resumen.topProductos.map((p, indice) => (
                  <li key={p.producto} className="flex items-center gap-3 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-page text-xs font-bold text-primary">
                      {indice + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary">{p.producto}</span>
                    <span className="text-right text-xs text-ink/55">
                      {p.cantidad} uds.
                      <br />
                      {moneda.format(p.monto)}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </>
      )}
    </>
  );
}