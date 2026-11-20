"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { Empleado } from "@/types/empleado";
import { sucursales } from "@/data/sucursales";

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
  siguienteId: string;
  duisExistentes: string[];
  onCerrar: () => void;
  onGuardar: (e: Empleado) => void;
};

export default function NuevoEmpleadoModal({ siguienteId, duisExistentes, onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [dui, setDui] = useState("");
  const [cargo, setCargo] = useState("");
  const [sucursal, setSucursal] = useState(sucursales[0].nombre);
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().slice(0, 10));
  const [salario, setSalario] = useState("");

  const monto = Number(salario);
  const duplicado = dui.trim() !== "" && duisExistentes.includes(dui.trim());
  const puedeGuardar = nombre.trim() !== "" && cargo.trim() !== "" && monto > 0 && !duplicado;

  const guardar = () => {
    onGuardar({
      id: siguienteId,
      nombre: nombre.trim(),
      dui: dui.trim(),
      cargo: cargo.trim(),
      sucursal,
      fechaIngreso,
      salario: monto,
      estado: "Activo",
    });
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Nuevo empleado · {siguienteId}</h2>
          <button onClick={onCerrar} className="text-stone-400 hover:text-stone-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo etiqueta="Nombre completo">
              <input className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Campo>
          </div>
          <div>
            <Campo etiqueta="DUI">
              <input className={campo} value={dui} onChange={(e) => setDui(e.target.value)} placeholder="00000000-0" />
            </Campo>
            {duplicado && <p className="mt-1 text-xs text-red-600">Ya existe un empleado con ese DUI.</p>}
          </div>
          <Campo etiqueta="Cargo">
            <input className={campo} value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </Campo>
          <Campo etiqueta="Sucursal">
            <select className={campo} value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
              {sucursales.map((s) => (
                <option key={s.id} value={s.nombre}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Fecha de ingreso">
            <input type="date" className={campo} value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
          </Campo>
          <div className="sm:col-span-2">
            <Campo etiqueta="Salario mensual (USD)">
              <input
                type="number"
                min="0"
                step="0.01"
                className={campo}
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
              />
            </Campo>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCerrar} className="rounded-lg border border-stone-300 px-5 py-2 text-sm text-stone-600">
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={!puedeGuardar}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Registrar empleado
          </button>
        </div>
      </div>
    </div>
  );
}