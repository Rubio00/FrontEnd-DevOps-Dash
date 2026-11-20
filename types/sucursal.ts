export type EstadoSucursal = "activa" | "inactiva";

export type Correlativo = {
  inicial: number;
  siguiente: number;
};

export type DatosSucursal = {
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  encargado: string;
  estado: EstadoSucursal;
};

export type Sucursal = DatosSucursal & {
  id: string;
  fcf: Correlativo;
  ccf: Correlativo;
};