// Fecha de referencia calculada en el servidor: los datos ya vienen de la API,
// así que el período se mide contra el día actual.
export const FECHA_REFERENCIA = new Date().toISOString().slice(0, 10);

export function restarDias(fecha: string, dias: number) {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

export function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}