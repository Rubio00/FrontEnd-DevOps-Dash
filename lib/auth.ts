import { modulos } from "@/data/menu";
import { usuarios } from "@/data/usuarios";
import type { Rol, Usuario } from "@/types/auth";
import type { Modulo } from "@/types/menu";

/** Busca un usuario simulado por id (más adelante: sesión de la API). */
export function buscarUsuario(id: string | null | undefined): Usuario | undefined {
  if (!id) return undefined;
  return usuarios.find((usuario) => usuario.id === id);
}

/** Módulos que el rol puede ver en el menú. */
export function modulosPorRol(rol: Rol): Modulo[] {
  return modulos.filter((modulo) => modulo.roles.includes(rol));
}

/** Módulos existentes que el rol NO puede ver. */
export function modulosBloqueados(rol: Rol): Modulo[] {
  return modulos.filter((modulo) => !modulo.roles.includes(rol));
}

/** Verificación puntual, útil para proteger enlaces o acciones. */
export function puedeAcceder(rol: Rol, moduloId: string): boolean {
  return modulos.some((modulo) => modulo.id === moduloId && modulo.roles.includes(rol));
}
