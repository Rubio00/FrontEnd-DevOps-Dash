"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { DatosProveedor } from "@/types/proveedor";
import { condicionesCredito } from "@/types/proveedor";

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
  existentes: string[];
  onCerrar: () => void;
  onGuardar: (datos: DatosProveedor) => Promise<void>;
};

export default function NuevoProveedorModal({ existentes, onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [nit, setNit] = useState("");
  const [nrc, setNrc] = useState("");
  const [diasCredito, setDiasCredito] = useState(0);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const duplicado = existentes.some((e) => e.toLowerCase() === nombre.trim().toLowerCase());
  const puedeGuardar = nombre.trim() !== "" && !duplicado;

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!puedeGuardar) return;
    setError("");
    setGuardando(true);
    try {
      await onGuardar({
        nombre: nombre.trim(),
        nit: nit.trim(),
        nrc: nrc.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        direccion: direccion.trim(),
        diasCredito,
        activo: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar el proveedor.");
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={guardar} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Nuevo proveedor</h2>
          <button type="button" onClick={onCerrar} className="text-stone-400 hover:text-stone-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo etiqueta="Nombre del proveedor">
              <input className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={2} />
            </Campo>
            {duplicado && <p className="mt-1 text-xs text-red-600">Ya existe un proveedor con ese nombre.</p>}
          </div>
          <Campo etiqueta="Teléfono">
            <input className={campo} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </Campo>
          <Campo etiqueta="Correo">
            <input type="email" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Campo>
          <div className="sm:col-span-2">
            <Campo etiqueta="Dirección">
              <input className={campo} value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </Campo>
          </div>
          <Campo etiqueta="NIT">
            <input className={campo} value={nit} onChange={(e) => setNit(e.target.value)} />
          </Campo>
          <Campo etiqueta="NRC">
            <input className={campo} value={nrc} onChange={(e) => setNrc(e.target.value)} />
          </Campo>
          <div className="sm:col-span-2">
            <Campo etiqueta="Condición de pago">
              <select className={campo} value={diasCredito} onChange={(e) => setDiasCredito(Number(e.target.value))}>
                {condicionesCredito.map((c) => (
                  <option key={c.dias} value={c.dias}>
                    {c.etiqueta}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
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
            {guardando ? "Registrando..." : "Registrar proveedor"}
          </button>
        </div>
      </form>
    </div>
  );
}
