"use client";

import { useSyncExternalStore } from "react";
import { usuarioDemoPorDefecto, usuarios } from "@/data/usuarios";
import { buscarUsuario } from "@/lib/auth";

const CLAVE_SESION = "origenes:usuario";
const EVENTO_SESION = "origenes:sesion";

function suscribir(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO_SESION, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO_SESION, callback);
  };
}

function leerUsuarioId(): string {
  try {
    const guardado = window.localStorage.getItem(CLAVE_SESION);
    if (guardado && buscarUsuario(guardado)) return guardado;
  } catch {
    // localStorage puede estar deshabilitado (modo privado / políticas).
  }
  return usuarioDemoPorDefecto;
}

/**
 * Sesión simulada mientras no existe API. Persiste el usuario elegido en
 * localStorage para que la demostración del menú por roles sobreviva recargas
 * y se sincronice entre pestañas.
 */
export function useSesion() {
  const usuarioId = useSyncExternalStore(suscribir, leerUsuarioId, () => usuarioDemoPorDefecto);
  const usuario = buscarUsuario(usuarioId) ?? usuarios[0];

  function cambiarUsuario(id: string) {
    if (!buscarUsuario(id)) return;
    try {
      window.localStorage.setItem(CLAVE_SESION, id);
    } catch {
      // Si no hay persistencia disponible, el cambio solo aplica en memoria.
    }
    window.dispatchEvent(new Event(EVENTO_SESION));
  }

  return { usuario, cambiarUsuario };
}
