import { modulos } from "@/data/menu";
import { normalizarRol } from "@/types/auth";
import type { Modulo } from "@/types/menu";

/** Módulos que el rol puede ver en el menú. */
export function modulosPorRol(rol: string): Modulo[] {
  const actual = normalizarRol(rol);
  return modulos.filter((modulo) => modulo.roles.includes(actual));
}

/** Módulos existentes que el rol NO puede ver. */
export function modulosBloqueados(rol: string): Modulo[] {
  const actual = normalizarRol(rol);
  return modulos.filter((modulo) => !modulo.roles.includes(actual));
}

/** Verificación puntual, útil para proteger enlaces o acciones. */
export function puedeAcceder(rol: string, moduloId: string): boolean {
  const actual = normalizarRol(rol);
  return modulos.some((modulo) => modulo.id === moduloId && modulo.roles.includes(actual));
}

