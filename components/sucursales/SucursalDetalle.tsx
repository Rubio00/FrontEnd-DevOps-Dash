"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { documentos, documentosEmitidos, numeroDocumento } from "@/lib/correlativos";
import { actualizarSucursal, getSucursales } from "@/services/sucursales";
import type { DatosSucursal, Sucursal } from "@/types/sucursal";
import SucursalFormModal from "./SucursalFormModal";

export default function SucursalDetalle({ inicial }: { inicial: Sucursal }) {
  const [sucursal, setSucursal] = useState(inicial);
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(""), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  async function guardar(datos: DatosSucursal) {
    const existentes = await getSucursales();
    const actualizada = await actualizarSucursal(sucursal, datos, existentes);
    setSucursal(actualizada);
    setEditando(false);
    setAviso("Los datos de la sucursal se actualizaron.");
  }

  const activa = sucursal.estado === "activa";
  const datos: [string, string][] = [
    ["Código", sucursal.codigo],
    ["Dirección", sucursal.direccion],
    ["Ciudad", sucursal.ciudad],
    ["Teléfono", sucursal.telefono],
    ["Encargado", sucursal.encargado],
  ];

  return (
    <>
      <Link href="/sucursales" className="text-sm font-semibold text-accent hover:underline">
        ← Volver a sucursales
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-primary">{sucursal.nombre}</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              activa ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
            }`}
          >
            {activa ? "Activa" : "Inactiva"}
          </span>
        </div>
        <button
          className="rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
          onClick={() => setEditando(true)}
          type="button"
        >
          Editar sucursal
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Datos generales</h3>
          <dl className="mt-4 divide-y divide-primary/8">
            {datos.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="py-3">
                <dt className="text-xs font-semibold text-ink/45">{etiqueta}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{valor}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Correlativos de facturación</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {documentos.map((doc) => {
              const correlativo = doc.tipo === "FCF" ? sucursal.fcf : sucursal.ccf;
              return (
                <article key={doc.tipo} className="rounded-xl bg-page p-5">
                  <p className="text-sm font-bold text-primary">{doc.tipo} · {doc.nombre}</p>
                  <p className="mt-1 text-xs text-muted">{doc.detalle}</p>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink/40">Próximo número</p>
                  <p className="mt-1 font-mono text-lg font-bold text-primary">
                    {numeroDocumento(doc.tipo, sucursal.codigo, correlativo.siguiente)}
                  </p>
                  <div className="mt-4 flex justify-between border-t border-primary/10 pt-3 text-xs text-ink/55">
                    <span>Inicio: {correlativo.inicial.toLocaleString("es-SV")}</span>
                    <span>Emitidos: {documentosEmitidos(correlativo).toLocaleString("es-SV")}</span>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            Los correlativos avanzan automáticamente al emitir documentos desde Ventas y no se editan manualmente.
          </p>
        </section>
      </div>

      {editando && (
        <SucursalFormModal sucursal={sucursal} onClose={() => setEditando(false)} onGuardar={guardar} />
      )}

      {aviso && (
        <div
          className="fixed bottom-5 right-5 z-[60] max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-900 shadow-xl"
          role="status"
        >
          {aviso}
        </div>
      )}
    </>
  );
}