import type { DatosSucursal, Sucursal } from "@/types/sucursal";

/** Validación de UX antes de enviar. El backend vuelve a validar con Joi. */
export function validarSucursal(datos: DatosSucursal, existentes: Sucursal[], idActual?: number): string | null {
  const nombre = datos.nombre.trim();
  const telefono = datos.telefono.trim();

  if (!nombre || nombre.length < 3) {
    return "El nombre de la sucursal debe tener al menos 3 caracteres.";
  }
  if (datos.direccion.trim().length > 200) {
    return "La dirección no puede superar los 200 caracteres.";
  }
  if (telefono && !/^\d{4}-?\d{4}$/.test(telefono)) {
    return "Ingresá un teléfono válido de 8 dígitos, por ejemplo 2222-3333.";
  }

  const otras = existentes.filter((sucursal) => sucursal.id !== idActual);
  if (otras.some((sucursal) => sucursal.nombre.trim().toLowerCase() === nombre.toLowerCase())) {
    return "Ya existe una sucursal con ese nombre.";
  }

  return null;
}
