"use client";

import { useState } from "react";
import type { Empleado } from "@/types/empleado";
import { nombreEmpleado } from "@/types/empleado";
import { usd } from "@/lib/format";
import { calcularBoleta } from "@/lib/planilla";
import { crearEmpleado, cambiarEstadoEmpleado } from "@/services/empleados.client";
import KpiCard from "@/components/KpiCard";
import BoletaEmpleado from "./BoletaEmpleado";
import NuevoEmpleadoModal from "./NuevoEmpleadoModal";
import EstadoEmpleadoModal from "./EstadoEmpleadoModal";

type Filtro = "Activos" | "Inactivos" | "Todos";
const filtros: Filtro[] = ["Activos", "Inactivos", "Todos"];

type Props = {
  iniciales: Empleado[];
  sucursales: { id: number; nombre: string }[];
};

export default function PlanillaPanel({ iniciales, sucursales }: Props) {
  const [empleados, setEmpleados] = useState(iniciales);
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(iniciales[0]?.id ?? null);
  const [modal, setModal] = useState(false);
  const [gestionando, setGestionando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Activos");

  const texto = busqueda.trim().toLowerCase();
  const visibles = empleados.filter((e) => {
    const coincide = [nombreEmpleado(e), e.puesto, e.dui ?? "", e.sucursal?.nombre ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(texto);
    const pasa = filtro === "Todos" || (filtro === "Activos" ? e.activo : !e.activo);
    return coincide && pasa;
  });

  const activos = empleados.filter((e) => e.activo);
  const boletas = activos.map((e) => calcularBoleta(e.salarioMensual));
  const totalBruto = boletas.reduce((s, b) => s + b.salario, 0);
  const totalNeto = boletas.reduce((s, b) => s + b.neto, 0);
  const costoEmpresa = boletas.reduce((s, b) => s + b.costoEmpresa, 0);

  const seleccionado = empleados.find((e) => e.id === seleccionadoId) ?? null;

  const aplicarCambio = async (activo: boolean) => {
    if (!seleccionado) return;
    const actualizado = await cambiarEstadoEmpleado(seleccionado.id, activo);
    setEmpleados((prev) => prev.map((e) => (e.id === actualizado.id ? actualizado : e)));
    setGestionando(false);
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard texto="Empleados activos" valor={activos.length} />
        <KpiCard texto="Planilla bruta quincenal" valor={usd(totalBruto)} />
        <KpiCard texto="Neto a pagar (quincena)" valor={usd(totalNeto)} />
        <KpiCard texto="Costo empresa (quincena)" valor={usd(costoEmpresa)} />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, puesto, DUI o sucursal..."
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
          + Nuevo empleado
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-page text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Empleado</th>
                <th className="px-5 py-3 font-medium">Sucursal</th>
                <th className="px-5 py-3 text-right font-medium">Salario</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSeleccionadoId(e.id)}
                  className={`cursor-pointer border-t border-stone-100 transition hover:bg-accent/5 ${
                    e.id === seleccionadoId ? "bg-accent/10" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-primary">{nombreEmpleado(e)}</p>
                    <p className="text-xs text-stone-400">
                      EMP-{String(e.id).padStart(3, "0")} · {e.puesto}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm">{e.sucursal?.nombre ?? "—"}</td>
                  <td className="px-5 py-4 text-right text-sm font-medium">{usd(e.salarioMensual)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        e.activo ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {e.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibles.length === 0 && (
            <p className="py-10 text-center text-stone-400">No hay empleados que coincidan.</p>
          )}
        </div>

        {seleccionado ? (
          <BoletaEmpleado empleado={seleccionado} onCambiarEstado={() => setGestionando(true)} />
        ) : (
          <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
            Selecciona un empleado para ver su balance.
          </p>
        )}
      </div>

      {gestionando && seleccionado && (
        <EstadoEmpleadoModal empleado={seleccionado} onCerrar={() => setGestionando(false)} onCambiar={aplicarCambio} />
      )}

      {modal && (
        <NuevoEmpleadoModal
          sucursales={sucursales}
          duisExistentes={empleados.map((e) => e.dui ?? "").filter(Boolean)}
          onCerrar={() => setModal(false)}
          onGuardar={async (datos) => {
            const creado = await crearEmpleado(datos);
            setEmpleados((prev) => [creado, ...prev]);
            setSeleccionadoId(creado.id);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}
