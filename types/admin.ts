/** Tipos del módulo Administración (usuarios y roles). */

export type RolAdmin = {
  id: number;
  nombre: string;
  usuarios?: number;
};

export type UsuarioAdmin = {
  id: number;
  email: string;
  activo: boolean;
  rolId: number | null;
  sucursalId: number | null;
  empleadoId: number | null;
  rol: { id: number; nombre: string } | null;
  sucursal: { id: number; nombre: string } | null;
  empleado: { id: number; nombres: string; apellidos: string; puesto: string } | null;
};

export type DatosUsuario = {
  empleadoId: number | null;
  sucursalId: number;
  rolId: number;
  email: string;
  password?: string;
  activo: boolean;
};

export function nombreDeUsuario(usuario: UsuarioAdmin): string {
  if (usuario.empleado) return `${usuario.empleado.nombres} ${usuario.empleado.apellidos}`.trim();
  return usuario.email;
}
