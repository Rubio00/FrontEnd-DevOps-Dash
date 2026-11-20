"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { DatosSucursal, Sucursal } from "@/types/sucursal";

type Props = {
  sucursal?: Sucursal;
  onClose: () => void;
  onGuardar: (datos: DatosSucursal) => Promise<void>;
};

const input =
  "mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-page disabled:text-ink/50";

export default function SucursalFormModal({ sucursal, onClose, onGuardar }: Props) {
  const editando = Boolean(sucursal);
  const [nombre, setNombre] = useState(sucursal?.nombre ?? "");
  const [direccion, setDireccion] = useState(sucursal?.direccion ?? "");
  const [telefono, setTelefono] = useState(sucursal?.telefono ?? "");
  const [activa, setActiva] = useState(sucursal?.activa ?? true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    function alPresionar(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await onGuardar({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        activa,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la sucursal.");
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="sucursal-modal-titulo"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h2 id="sucursal-modal-titulo" className="text-xl font-bold text-primary">
              {editando ? "Editar sucursal" : "Nueva sucursal"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {editando
                ? "Los correlativos no se modifican desde aquí."
                : "El backend genera automáticamente los correlativos FCF y CCF."}
            </p>
          </div>
          <button
            aria-label="Cerrar ventana"
            className="rounded-lg px-3 py-2 text-sm font-bold text-ink/50 transition hover:bg-page hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-primary sm:col-span-2">
              Nombre
              <input
                autoFocus
                className={input}
                minLength={3}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Orígenes Santa Ana"
                required
                type="text"
                value={nombre}
              />
            </label>
            <label className="block text-sm font-semibold text-primary sm:col-span-2">
              Dirección
              <input
                className={input}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle, número y referencia"
                type="text"
                value={direccion}
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Teléfono
              <input
                className={input}
                inputMode="tel"
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="2222-3333"
                type="text"
                value={telefono}
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Estado
              <select className={input} onChange={(e) => setActiva(e.target.value === "activa")} value={activa ? "activa" : "inactiva"}>
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </label>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-primary/10 pt-5">
            <button
              className="rounded-xl border border-primary/15 px-4 py-2.5 text-sm font-bold text-ink/60 transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
              disabled={guardando}
              type="submit"
            >
              {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear sucursal"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
