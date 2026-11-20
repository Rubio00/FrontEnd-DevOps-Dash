import type { DatosSucursal, Sucursal } from "@/types/sucursal";

type Opciones = { idActual?: string; inicialFcf?: number; inicialCcf?: number };

export function validarSucursal(
  datos: DatosSucursal,
  existentes: Sucursal[],
  opciones: Opciones = {},
): string | null {
  const nombre = datos.nombre.trim();
  const codigo = datos.codigo.trim().toUpperCase();

  if (!nombre || !codigo || !datos.direccion.trim() || !datos.ciudad.trim() || !datos.encargado.trim() || !datos.telefono.trim()) {
    return "Completá todos los campos de la sucursal.";
  }
  if (!/^[A-Z0-9]{2,6}$/.test(codigo)) {
    return "El código debe tener entre 2 y 6 letras o números, sin espacios.";
  }
  if (!/^\d{4}-?\d{4}$/.test(datos.telefono.trim())) {
    return "Ingresá un teléfono válido de 8 dígitos, por ejemplo 2222-3333.";
  }

  const otras = existentes.filter((s) => s.id !== opciones.idActual);
  if (otras.some((s) => s.codigo === codigo)) return "Ya existe una sucursal con ese código.";
  if (otras.some((s) => s.nombre.toLocaleLowerCase("es") === nombre.toLocaleLowerCase("es"))) {
    return "Ya existe una sucursal con ese nombre.";
  }

  for (const [etiqueta, valor] of [["FCF", opciones.inicialFcf], ["CCF", opciones.inicialCcf]] as const) {
    if (valor !== undefined && (!Number.isInteger(valor) || valor < 1 || valor > 99999999)) {
      return `El número inicial de ${etiqueta} debe ser un entero entre 1 y 99,999,999.`;
    }
  }
  return null;
}