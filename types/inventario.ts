/** Tipos del módulo Inventario, alineados con el backend. */

export type ProveedorOpcion = {
  id: number;
  nombre: string;
};

export type Insumo = {
  id: number;
  nombre: string;
  sku: string | null;
  categoria: string | null;
  unidad: string;
  costoPromedio: number;
  activo: boolean;
  proveedores: ProveedorOpcion[];
};

export type StockSucursal = {
  id: number;
  sucursalId: number;
  insumoId: number;
  stockActual: number;
  stockMinimo: number;
  actualizadoEn: string;
  sucursal: { id: number; nombre: string } | null;
  insumo: Insumo | null;
};

export type TipoMovimiento = "entrada" | "salida" | "ajuste";

export type MovimientoStock = {
  id: number;
  sucursalId: number;
  insumoId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  fecha: string;
  sucursal?: { id: number; nombre: string } | null;
  insumo?: { id: number; nombre: string; unidad: string } | null;
  usuario?: { id: number; email: string } | null;
};

export type TipoProducto = "elaborado" | "reventa";

export type RecetaIngrediente = {
  id: number;
  productoId: number;
  insumoId: number;
  cantidad: number;
  insumo: { id: number; nombre: string; unidad: string; costoPromedio: number };
};

export type ProductoInventario = {
  id: number;
  nombre: string;
  sku: string | null;
  categoria: string | null;
  tipo: TipoProducto;
  precio: number;
  insumoId: number | null;
  activo: boolean;
  insumo?: { id: number; nombre: string; unidad: string; costoPromedio: number } | null;
  receta: RecetaIngrediente[];
};

export type Categoria = {
  id: number;
  nombre: string;
};

export type DatosInsumo = {
  nombre: string;
  sku: string;
  categoria: string;
  unidad: string;
  costoPromedio: number;
  activo: boolean;
  proveedorIds: number[];
};

export type DatosProducto = {
  nombre: string;
  sku: string;
  categoria: string;
  tipo: TipoProducto;
  precio: number;
  insumoId: number | null;
  activo: boolean;
};

export type Ingrediente = {
  insumoId: number;
  cantidad: number;
};

export function estadoStock(stock: number, minimo: number): "agotado" | "bajo" | "disponible" {
  if (stock <= 0) return "agotado";
  if (stock <= minimo) return "bajo";
  return "disponible";
}
