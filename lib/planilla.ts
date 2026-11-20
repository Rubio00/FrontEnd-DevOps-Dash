// Porcentajes de ley (según el caso de negocio). Si cambian, se modifican solo aquí.
export const ISSS_EMPLEADO = 0.03;
export const ISSS_PATRONAL = 0.075;
export const ISSS_TOPE_QUINCENA = 500; // el ISSS se calcula hasta $1,000 al mes ($500 por quincena)
export const AFP_EMPLEADO = 0.0725;
export const AFP_PATRONAL = 0.0875;

const redondear = (n: number) => Math.round(n * 100) / 100;

// Retención de renta QUINCENAL: base = salario quincenal - ISSS - AFP
function retencionRenta(base: number) {
  if (base <= 236) return 0;
  if (base <= 447.62) return (base - 236) * 0.1 + 8.83;
  if (base <= 1019.05) return (base - 447.62) * 0.2 + 30;
  return (base - 1019.05) * 0.3 + 144.28;
}

export type Boleta = {
  salario: number; // salario de la quincena
  isss: number;
  afp: number;
  renta: number;
  totalDescuentos: number;
  neto: number;
  isssPatronal: number;
  afpPatronal: number;
  costoEmpresa: number;
};

// Recibe el salario MENSUAL del empleado y devuelve la boleta de UNA quincena.
export function calcularBoleta(salarioMensual: number): Boleta {
  const salario = redondear(salarioMensual / 2);
  const baseIsss = Math.min(salario, ISSS_TOPE_QUINCENA);
  const isss = redondear(baseIsss * ISSS_EMPLEADO);
  const afp = redondear(salario * AFP_EMPLEADO);
  const renta = redondear(retencionRenta(salario - isss - afp));
  const totalDescuentos = redondear(isss + afp + renta);
  const isssPatronal = redondear(baseIsss * ISSS_PATRONAL);
  const afpPatronal = redondear(salario * AFP_PATRONAL);

  return {
    salario,
    isss,
    afp,
    renta,
    totalDescuentos,
    neto: redondear(salario - totalDescuentos),
    isssPatronal,
    afpPatronal,
    costoEmpresa: redondear(salario + isssPatronal + afpPatronal),
  };
}