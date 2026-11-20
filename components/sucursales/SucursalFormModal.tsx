"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { documentos, numeroDocumento } from "@/lib/correlativos";
import type { DatosSucursal, EstadoSucursal, Sucursal } from "@/types/sucursal";

type Props = {
  sucursal?: Sucursal;
  onClose: () => void;
  onGuardar: (datos: DatosSucursal, inicialFcf: number, inicialCcf: number) => Promise<void>;
};

const input =
  "mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-page disabled:text-ink/50";

export default function SucursalFormModal({ sucursal, onClose, onGuardar }: Props) {
  const editando = Boolean(sucursal);
  const [nombre, setNombre] = useState(sucursal?.nombre ?? "");
  const [codigo, setCodigo] = useState(sucursal?.codigo ?? "");
  const [direccion, setDireccion] = useState(sucursal?.direccion ?? "");
  const [ciudad, setCiudad] = useState(sucursal?.ciudad ?? "");
  const [telefono, setTelefono] = useState(sucursal?.telefono ?? "");
  const [encargado, setEncargado] = useState(sucursal?.encargado ?? "");
  const [estado, setEstado] = useState<EstadoSucursal>(sucursal?.estado ?? "activa");
  const [inicialFcf, setInicialFcf] = useState("1");
  const [inicialCcf, setInicialCcf] = useState("1");
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
      await onGuardar(
        { nombre, codigo, direccion, ciudad, telefono, encargado, estado },
        Number(inicialFcf),
        Number(inicialCcf),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la sucursal.");
      setGuardando(false);
    }
  }

  const iniciales = { FCF: inicialFcf, CCF: inicialCcf } as const;
  const cambiarInicial = { FCF: setInicialFcf, CCF: setInicialCcf } as const;

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
                ? "El código y los correlativos no se pueden modificar."
                : "Al crearla se generan sus correlativos base de FCF y CCF."}
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
            <label className="block text-sm font-semibold text-primary">
              Nombre
              <input autoFocus className={input} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Santa Ana" required type="text" value={nombre} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Código
              <input
                className={`${input} font-mono uppercase`}
                disabled={editando}
                maxLength={6}
                onChange={(e) => setCodigo(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                placeholder="Ej. SAN"
                required
                type="text"
                value={codigo}
              />
            </label>
            <label className="block text-sm font-semibold text-primary sm:col-span-2">
              Dirección
              <input className={input} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número y referencia" required type="text" value={direccion} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Ciudad
              <input className={input} onChange={(e) => setCiudad(e.target.value)} placeholder="Ej. Santa Ana" required type="text" value={ciudad} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Teléfono
              <input className={input} inputMode="tel" onChange={(e) => setTelefono(e.target.value)} placeholder="2222-3333" required type="text" value={telefono} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Encargado
              <input className={input} onChange={(e) => setEncargado(e.target.value)} placeholder="Nombre completo" required type="text" value={encargado} />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Estado
              <select className={input} onChange={(e) => setEstado(e.target.value as EstadoSucursal)} value={estado}>
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </label>
          </div>

          {!editando && (
            <fieldset className="rounded-2xl border border-primary/10 p-4">
              <legend className="px-2 text-sm font-bold text-primary">Correlativos base</legend>
              <p className="mb-4 text-xs leading-5 text-muted">
                Número desde el que empieza a numerarse cada documento. Por defecto es 1.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {documentos.map((doc) => (
                  <label key={doc.tipo} className="block text-xs font-semibold text-primary">
                    {doc.tipo} · {doc.nombre}
                    <input
                      className={input}
                      min="1"
                      onChange={(e) => cambiarInicial[doc.tipo](e.target.value)}
                      required
                      step="1"
                      type="number"
                      value={iniciales[doc.tipo]}
                    />
                    <span className="mt-2 block font-mono text-[11px] font-normal text-ink/50">
                      {numeroDocumento(doc.tipo, codigo || "COD", Number(iniciales[doc.tipo]) || 1)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

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