"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { sucursales } from "@/data/sucursales";
import { useSesion } from "@/lib/useSesion";
import { validarClave, validarContacto } from "@/lib/validarPerfil";
import { etiquetasRol } from "@/types/auth";

const input =
  "mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function PerfilPanel() {
  const { usuario } = useSesion();
  const sucursal = sucursales.find((item) => item.id === usuario.sucursalId);

  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errorContacto, setErrorContacto] = useState("");

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errorClave, setErrorClave] = useState("");

  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(""), 4000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  function guardarContacto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validarContacto(correo, telefono);
    setErrorContacto(error ?? "");
    if (error) return;
    setAviso("Tus datos de contacto se actualizaron.");
  }

  function cambiarClave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validarClave(actual, nueva, confirmacion);
    setErrorClave(error ?? "");
    if (error) return;
    setActual("");
    setNueva("");
    setConfirmacion("");
    setAviso("Tu contraseña se cambió correctamente.");
  }

  const datos: [string, string][] = [
    ["Cargo", usuario.cargo],
    ["Rol", etiquetasRol[usuario.rol]],
    ["Sucursal", sucursal?.nombre ?? "Sin sucursal"],
  ];

  return (
    <>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Mi cuenta</p>
        <h2 className="mt-2 text-2xl font-bold">Perfil</h2>
        <p className="mt-1 text-sm text-muted">Datos de tu sesión, contacto y seguridad.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="h-fit rounded-2xl border border-primary/10 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {usuario.iniciales}
          </div>
          <h3 className="mt-4 text-xl font-bold text-primary">{usuario.nombre}</h3>
          <span className="mt-2 inline-block rounded-full bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
            {etiquetasRol[usuario.rol]}
          </span>

          <dl className="mt-6 divide-y divide-primary/8 text-left">
            {datos.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="py-3">
                <dt className="text-xs font-semibold text-ink/45">{etiqueta}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{valor}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/login"
            className="mt-6 block rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Cerrar sesión
          </Link>
        </section>

        <div className="space-y-6">
          <form className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm" onSubmit={guardarContacto}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Datos de contacto</h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-primary">
                Correo electrónico
                <input className={input} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@origenes.sv" required type="email" value={correo} />
              </label>
              <label className="block text-sm font-semibold text-primary">
                Teléfono
                <input className={input} inputMode="tel" onChange={(e) => setTelefono(e.target.value)} placeholder="7777-8888" required type="text" value={telefono} />
              </label>
            </div>
            {errorContacto && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
                {errorContacto}
              </p>
            )}
            <div className="mt-5 flex justify-end">
              <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent" type="submit">
                Guardar contacto
              </button>
            </div>
          </form>

          <form className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm" onSubmit={cambiarClave}>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">Cambiar contraseña</h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <label className="block text-sm font-semibold text-primary">
                Contraseña actual
                <input autoComplete="current-password" className={input} onChange={(e) => setActual(e.target.value)} required type="password" value={actual} />
              </label>
              <label className="block text-sm font-semibold text-primary">
                Nueva contraseña
                <input autoComplete="new-password" className={input} onChange={(e) => setNueva(e.target.value)} required type="password" value={nueva} />
              </label>
              <label className="block text-sm font-semibold text-primary">
                Confirmar nueva
                <input autoComplete="new-password" className={input} onChange={(e) => setConfirmacion(e.target.value)} required type="password" value={confirmacion} />
              </label>
            </div>
            <p className="mt-3 text-xs text-muted">Mínimo 8 caracteres, con al menos una letra y un número.</p>
            {errorClave && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
                {errorClave}
              </p>
            )}
            <div className="mt-5 flex justify-end">
              <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent" type="submit">
                Cambiar contraseña
              </button>
            </div>
          </form>
        </div>
      </div>

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