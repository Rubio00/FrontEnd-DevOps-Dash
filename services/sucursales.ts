import { sucursalesDetalle } from "@/data/sucursalesDetalle";
import { generarCorrelativoBase, siguienteIdSucursal } from "@/lib/correlativos";
import { validarSucursal } from "@/lib/validarSucursal";
import type { DatosSucursal, Sucursal } from "@/types/sucursal";

function limpiar(datos: DatosSucursal): DatosSucursal {
  return {
    ...datos,
    nombre: datos.nombre.trim(),
    codigo: datos.codigo.trim().toUpperCase(),
    direccion: datos.direccion.trim(),
    ciudad: datos.ciudad.trim(),
    telefono: datos.telefono.trim(),
    encargado: datos.encargado.trim(),
  };
}

export async function getSucursales(): Promise<Sucursal[]> {
  return sucursalesDetalle.map((s) => ({ ...s }));
}

export async function getSucursalPorId(id: string): Promise<Sucursal | null> {
  const encontrada = sucursalesDetalle.find((s) => s.id === id);
  return encontrada ? { ...encontrada } : null;
}

export async function crearSucursal(
  datos: DatosSucursal,
  inicialFcf: number,
  inicialCcf: number,
  existentes: Sucursal[],
): Promise<Sucursal> {
  const error = validarSucursal(datos, existentes, { inicialFcf, inicialCcf });
  if (error) throw new Error(error);

  return {
    ...limpiar(datos),
    id: siguienteIdSucursal(existentes.map((s) => s.id)),
    fcf: generarCorrelativoBase(inicialFcf),
    ccf: generarCorrelativoBase(inicialCcf),
  };
}

export async function actualizarSucursal(
  actual: Sucursal,
  cambios: DatosSucursal,
  existentes: Sucursal[],
): Promise<Sucursal> {
  const error = validarSucursal(cambios, existentes, { idActual: actual.id });
  if (error) throw new Error(error);

  // El código y los correlativos no se editan después de crear la sucursal.
  return { ...actual, ...limpiar(cambios), codigo: actual.codigo };
}