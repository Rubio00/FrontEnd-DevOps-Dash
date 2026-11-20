"use client";

import { useState } from "react";
import type { DatosProveedor, Proveedor } from "@/types/proveedor";
import { usd } from "@/lib/format";
import { crearProveedor } from "@/services/proveedores.client";
import ProveedorFila from "./ProveedorFila";
import NuevoProveedorModal from "./NuevoProveedorModal";

type Props = {
  iniciales: Proveedor[];
  saldos: Record<number, number>;
};

type Filtro = "Todos" | "Con saldo" | "Al día";
const filtros: Filtro[] = ["Todos", "Con saldo", "Al día"];

export default function ProveedoresPanel({ iniciales, saldos }: Props) {
  const [proveedores, setProveedores] = useState(iniciales);
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todos");

  const saldoDe = (p: Proveedor) => saldos[p.id] ?? 0;

  const texto = busqueda.trim().toLowerCase();
  const visibles = proveedores.filter((p) => {
    const coincide = [p.nombre, p.nit, p.nrc, p.email, p.direccion]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(texto);
    const s = saldoDe(p);
    const pasaFiltro = filtro === "Todos" || (filtro === "Con saldo" ? s > 0 : s === 0);
    return coincide && pasaFiltro;
  });

  const conSaldo = proveedores.filter((p) => saldoDe(p) > 0).length;
  const totalPorPagar = proveedores.reduce((s, p) => s + saldoDe(p), 0);

  const resumen = [
    { etiqueta: "Registrados", valor: String(proveedores.length) },
    { etiqueta: "Con saldo pendiente", valor: String(conSaldo) },
    { etiqueta: "Total por pagar", valor: usd(totalPorPagar) },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col divide-y divide-stone-200 rounded-xl bg-primary text-white shadow-sm sm:flex-row sm:divide-x sm:divide-y-0">
        {resumen.map((r) => (
          <div key={r.etiqueta} className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-widest text-white/60">{r.etiqueta}</p>
            <p className="mt-1 text-2xl font-bold">{r.valor}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, NIT, NRC o correo..."
          className="w-full max-w-sm rounded-full border border-stone-300 bg-white px-5 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <div className="flex gap-2">
          {filtros.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                filtro === f
                  ? "bg-primary text-white"
                  : "border border-stone-300 bg-white text-stone-600 hover:border-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModal(true)}
          className="ml-auto rounded-full bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
        >
          + Nuevo proveedor
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-page text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-5 py-3 font-medium">Proveedor</th>
              <th className="px-5 py-3 font-medium">Contacto</th>
              <th className="px-5 py-3 font-medium">Fiscal</th>
              <th className="px-5 py-3 font-medium">Pago</th>
              <th className="px-5 py-3 text-right font-medium">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => (
              <ProveedorFila key={p.id} proveedor={p} saldo={saldoDe(p)} />
            ))}
          </tbody>
        </table>
        {visibles.length === 0 && (
          <p className="py-10 text-center text-stone-400">No hay proveedores que coincidan.</p>
        )}
      </div>

      {modal && (
        <NuevoProveedorModal
          existentes={proveedores.map((p) => p.nombre)}
          onCerrar={() => setModal(false)}
          onGuardar={async (datos: DatosProveedor) => {
            const nuevo = await crearProveedor(datos);
            setProveedores((prev) => [nuevo, ...prev]);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}
