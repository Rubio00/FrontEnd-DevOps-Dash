"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { crearSucursal } from "@/services/sucursales";
import type { DatosSucursal, Sucursal } from "@/types/sucursal";
import SucursalCard from "./SucursalCard";
import SucursalFormModal from "./SucursalFormModal";

type Filtro = "todas" | "activa" | "inactiva";

export default function SucursalesPanel({ inicial }: { inicial: Sucursal[] }) {
  const [sucursales, setSucursales] = useState(inicial);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(""), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");
    return sucursales.filter((s) => {
      const coincideEstado = filtro === "todas" || s.estado === filtro;
      const coincideTexto =
        !texto ||
        s.nombre.toLocaleLowerCase("es").includes(texto) ||
        s.codigo.toLowerCase().includes(texto) ||
        s.ciudad.toLocaleLowerCase("es").includes(texto);
      return coincideEstado && coincideTexto;
    });
  }, [busqueda, filtro, sucursales]);

  const activas = sucursales.filter((s) => s.estado === "activa").length;

  async function crear(datos: DatosSucursal, inicialFcf: number, inicialCcf: number) {
    const nueva = await crearSucursal(datos, inicialFcf, inicialCcf, sucursales);
    setSucursales((actuales) => [...actuales, nueva]);
    setCreando(false);
    setAviso(`${nueva.nombre} se creó con sus correlativos FCF y CCF.`);
  }

  const filtros: { id: Filtro; etiqueta: string }[] = [
    { id: "todas", etiqueta: "Todas" },
    { id: "activa", etiqueta: "Activas" },
    { id: "inactiva", etiqueta: "Inactivas" },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-accent">Red de locales</p>
          <h2 className="mt-2 text-2xl font-bold">Sucursales</h2>
          <p className="mt-1 text-sm text-muted">
            {sucursales.length} registradas · {activas} activas
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          onClick={() => setCreando(true)}
          type="button"
        >
          <Icon name="plus" className="h-4 w-4" />
          Nueva sucursal
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative sm:w-80">
          <span className="sr-only">Buscar sucursal</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/35">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            className="w-full rounded-xl border border-primary/15 bg-white py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-ink/35 focus:border-accent focus:ring-2 focus:ring-accent/20"
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, código o ciudad"
            type="search"
            value={busqueda}
          />
        </label>
        <div className="flex gap-2">
          {filtros.map((f) => (
            <button
              key={f.id}
              aria-pressed={filtro === f.id}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent ${
                filtro === f.id
                  ? "border-primary bg-primary text-white"
                  : "border-primary/15 bg-white text-primary hover:bg-page"
              }`}
              onClick={() => setFiltro(f.id)}
              type="button"
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {visibles.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibles.map((sucursal) => (
            <SucursalCard key={sucursal.id} sucursal={sucursal} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white py-14 text-center text-sm text-muted">
          No encontramos sucursales con esos filtros.
        </p>
      )}

      {creando && <SucursalFormModal onClose={() => setCreando(false)} onGuardar={crear} />}

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