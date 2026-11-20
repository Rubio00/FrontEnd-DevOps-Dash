"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { DatosEmpleado, Puesto } from "@/types/empleado";
import { puestos } from "@/types/empleado";

const campo =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium">{etiqueta}</span>
      {children}
    </label>
  );
}

type Props = {
  sucursales: { id: number; nombre: string }[];
  duisExistentes: string[];
  onCerrar: () => void;
  onGuardar: (datos: DatosEmpleado) => Promise<void>;
};

export default function NuevoEmpleadoModal({ sucursales, duisExistentes, onCerrar, onGuardar }: Props) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [dui, setDui] = useState("");
  const [nit, setNit] = useState("");
  const [puesto, setPuesto] = useState<Puesto>("barista");
  const [sucursalId, setSucursalId] = useState<number | "">(sucursales[0]?.id ?? "");
  const [fechaContratacion, setFechaContratacion] = useState(new Date().toISOString().slice(0, 10));
  const [salario, setSalario] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const monto = Number(salario);
  const duiNormalizado = dui.trim();
  const duplicado = duiNormalizado !== "" && duisExistentes.includes(duiNormalizado);
  const duiValido = duiNormalizado === "" || /^\d{8}-\d$/.test(duiNormalizado);
  const puedeGuardar =
    nombres.trim() !== "" &&
    apellidos.trim() !== "" &&
    sucursalId !== "" &&
    monto > 0 &&
    duiValido &&
    !duplicado;

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!puedeGuardar) return;
    setError("");
    setGuardando(true);
    try {
      await onGuardar({
        sucursalId: Number(sucursalId),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        dui: duiNormalizado,
        nit: nit.trim(),
        puesto,
        salarioMensual: monto,
        fechaContratacion,
        activo: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar el empleado.");
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={guardar} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Nuevo empleado</h2>
          <button type="button" onClick={onCerrar} className="text-stone-400 hover:text-stone-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombres">
            <input className={campo} value={nombres} onChange={(e) => setNombres(e.target.value)} required minLength={2} />
          </Campo>
          <Campo etiqueta="Apellidos">
            <input className={campo} value={apellidos} onChange={(e) => setApellidos(e.target.value)} required minLength={2} />
          </Campo>
          <div>
            <Campo etiqueta="DUI">
              <input className={campo} value={dui} onChange={(e) => setDui(e.target.value)} placeholder="00000000-0" />
            </Campo>
            {!duiValido && <p className="mt-1 text-xs text-red-600">Formato esperado: 00000000-0.</p>}
            {duplicado && <p className="mt-1 text-xs text-red-600">Ya existe un empleado con ese DUI.</p>}
          </div>
          <Campo etiqueta="NIT">
            <input className={campo} value={nit} onChange={(e) => setNit(e.target.value)} placeholder="0000-000000-000-0" />
          </Campo>
          <Campo etiqueta="Puesto">
            <select className={campo} value={puesto} onChange={(e) => setPuesto(e.target.value as Puesto)}>
              {puestos.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.etiqueta}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Sucursal">
            <select className={campo} value={sucursalId} onChange={(e) => setSucursalId(Number(e.target.value))}>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Fecha de contratación">
            <input type="date" className={campo} value={fechaContratacion} onChange={(e) => setFechaContratacion(e.target.value)} required />
          </Campo>
          <Campo etiqueta="Salario mensual (USD)">
            <input
              type="number"
              min="0.01"
              step="0.01"
              className={campo}
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
              required
            />
          </Campo>
        </div>

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
            {guardando ? "Registrando..." : "Registrar empleado"}
          </button>
        </div>
      </form>
    </div>
  );
}
