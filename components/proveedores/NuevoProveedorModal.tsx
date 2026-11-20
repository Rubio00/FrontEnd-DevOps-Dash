"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { CondicionPago, Proveedor } from "@/types/proveedor";

const condiciones: CondicionPago[] = ["Contado", "Crédito 15 días", "Crédito 30 días"];

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
  existentes: string[];
  onCerrar: () => void;
  onGuardar: (p: Proveedor) => void;
};

export default function NuevoProveedorModal({ siguienteId, existentes, onCerrar, onGuardar }: Props) {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [nit, setNit] = useState("");
  const [nrc, setNrc] = useState("");
  const [condicionPago, setCondicionPago] = useState<CondicionPago>("Contado");

  const duplicado = existentes.some((e) => e.toLowerCase() === nombre.trim().toLowerCase());
  const puedeGuardar = nombre.trim() !== "" && !duplicado;

  const guardar = () => {
    onGuardar({
      id: siguienteId,
      nombre: nombre.trim(),
      contacto: contacto.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
      nit: nit.trim(),
      nrc: nrc.trim(),
      condicionPago,
    });
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Nuevo proveedor · {siguienteId}</h2>
          <button onClick={onCerrar} className="text-stone-400 hover:text-stone-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo etiqueta="Nombre del proveedor">
              <input className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Campo>
            {duplicado && <p className="mt-1 text-xs text-red-600">Ya existe un proveedor con ese nombre.</p>}
          </div>
          <Campo etiqueta="Contacto">
            <input className={campo} value={contacto} onChange={(e) => setContacto(e.target.value)} />
          </Campo>
          <Campo etiqueta="Teléfono">
            <input className={campo} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </Campo>
          <div className="sm:col-span-2">
            <Campo etiqueta="Correo">
              <input type="email" className={campo} value={correo} onChange={(e) => setCorreo(e.target.value)} />
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
              <select
                className={campo}
                value={condicionPago}
                onChange={(e) => setCondicionPago(e.target.value as CondicionPago)}
              >
                {condiciones.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
            Registrar proveedor
          </button>
        </div>
      </div>
    </div>
  );
}