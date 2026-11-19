"use client";

import { useState } from "react";
import type { Compra } from "@/types/compra";
import { sucursales } from "@/data/sucursales";
import { totalCompra } from "@/lib/compras";
import { usd } from "@/lib/format";
import { crearCompra } from "@/services/compras";
import KpiCard from "@/components/KpiCard";
import CompraCard from "./CompraCard";
import NuevaCompraModal from "./NuevaCompraModal";

const estados = ["Todos", "Borrador", "Por pagar", "Pagada"] as const;

export default function ComprasPanel({ iniciales }: { iniciales: Compra[] }) {
  const [compras, setCompras] = useState(iniciales);
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<(typeof estados)[number]>("Todos");
  const [sucursal, setSucursal] = useState("Todas");

  const texto = busqueda.trim().toLowerCase();
  const visibles = compras.filter((c) => {
    const contenido = [c.ref, c.proveedor, c.sucursal, ...c.lineas.map((l) => l.nombre)]
      .join(" ")
      .toLowerCase();
    return (
      (estado === "Todos" || c.estado === estado) &&
      (sucursal === "Todas" || c.sucursal === sucursal) &&
      contenido.includes(texto)
    );
  });

  const porPagar = compras.filter((c) => c.estado === "Por pagar");
  const borradores = compras.filter((c) => c.estado === "Borrador");

  const ultimo = compras.reduce((max, c) => Math.max(max, Number(c.ref.slice(3)) || 0), 0);
  const siguienteRef = `FC-${String(ultimo + 1).padStart(4, "0")}`;
  const proveedores = [...new Set(compras.map((c) => c.proveedor))];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard texto="Borradores" valor={borradores.length} />
        <KpiCard texto="Facturas por pagar" valor={porPagar.length} />
        <KpiCard texto="Cuentas por pagar" valor={usd(porPagar.reduce((s, c) => s + totalCompra(c), 0))} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-3">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por proveedor, referencia o insumo..."
            className="w-full max-w-sm rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <select
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="Todas">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.nombre}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setModal(true)}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
        >
          + Nueva compra
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {estados.map((e) => (
          <button
            key={e}
            onClick={() => setEstado(e)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              estado === e
                ? "border-primary bg-primary text-white"
                : "border-stone-300 bg-white text-stone-600 hover:border-accent"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Facturas de compra ({visibles.length})
        </h2>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-accent" />
      </div>

      {visibles.length === 0 ? (
        <p className="py-10 text-center text-stone-400">No hay facturas que coincidan.</p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((c) => (
            <CompraCard key={c.ref} compra={c} />
          ))}
        </section>
      )}

      {modal && (
        <NuevaCompraModal
          siguienteRef={siguienteRef}
          proveedores={proveedores}
          onCerrar={() => setModal(false)}
          onGuardar={async (c) => {
            const nueva = await crearCompra(c);
            setCompras((prev) => [nueva, ...prev]);
          }}
        />
      )}
    </div>
  );
}