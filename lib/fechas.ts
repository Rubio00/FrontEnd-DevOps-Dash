// Fecha fija para que los datos simulados no cambien entre servidor y navegador.
export const FECHA_REFERENCIA = "2026-11-20";

export function restarDias(fecha: string, dias: number) {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

export function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}