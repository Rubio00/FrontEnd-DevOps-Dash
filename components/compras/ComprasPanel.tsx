"use client";

import { useState } from "react";
import type { Compra, EstadoCompra, InsumoCompra } from "@/types/compra";
import { usd } from "@/lib/format";
import { crearCompra } from "@/services/compras.client";
import KpiCard from "@/components/KpiCard";
import CompraCard from "./CompraCard";
import NuevaCompraModal from "./NuevaCompraModal";

const estados: ("Todos" | EstadoCompra)[] = ["Todos", "Por pagar", "Pagada"];

type Props = {
  iniciales: Compra[];
  sucursales: { id: number; nombre: string }[];
  proveedores: { id: number; nombre: string }[];
  catalogo: InsumoCompra[];
};

export default function ComprasPanel({ iniciales, sucursales, proveedores, catalogo }: Props) {
  const [compras, setCompras] = useState(iniciales);
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<(typeof estados)[number]>("Todos");
  const [sucursalId, setSucursalId] = useState("todas");

  const texto = busqueda.trim().toLowerCase();
  const visibles = compras.filter((c) => {
    const contenido = [c.ref, c.proveedor, c.sucursal, ...c.lineas.map((l) => l.nombre)]
      .join(" ")
      .toLowerCase();
    return (
      (estado === "Todos" || c.estado === estado) &&
      (sucursalId === "todas" || c.sucursalId === Number(sucursalId)) &&
      contenido.includes(texto)
    );
  });

  const porPagar = compras.filter((c) => c.estado === "Por pagar");

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <KpiCard texto="Facturas registradas" valor={compras.length} />
        <KpiCard texto="Facturas por pagar" valor={porPagar.length} />
        <KpiCard texto="Cuentas por pagar" valor={usd(porPagar.reduce((s, c) => s + c.total, 0))} />
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
            value={sucursalId}
            onChange={(e) => setSucursalId(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="todas">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setModal(true)}
          disabled={proveedores.length === 0 || catalogo.length === 0}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
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
            <CompraCard key={c.id} compra={c} />
          ))}
        </section>
      )}

      {modal && (
        <NuevaCompraModal
          catalogo={catalogo}
          proveedores={proveedores}
          sucursales={sucursales}
          onCerrar={() => setModal(false)}
          onGuardar={async (datos) => {
            const nueva = await crearCompra(datos);
            setCompras((prev) => [nueva, ...prev]);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}
