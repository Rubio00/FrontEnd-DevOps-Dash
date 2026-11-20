import { peticionData } from "@/lib/cliente";
import type {
  Categoria,
  DatosInsumo,
  DatosProducto,
  Ingrediente,
  Insumo,
  ProductoInventario,
  RecetaIngrediente,
} from "@/types/inventario";

function aInsumo(insumo: Omit<Insumo, "costoPromedio"> & { costoPromedio: string }): Insumo {
  return {
    ...insumo,
    costoPromedio: Number(insumo.costoPromedio),
    proveedores: insumo.proveedores ?? [],
  };
}

function aProducto(
  producto: Omit<ProductoInventario, "precio" | "receta"> & { precio: string; receta?: unknown },
): ProductoInventario {
  return {
    ...producto,
    precio: Number(producto.precio),
    receta: (producto.receta as RecetaIngrediente[]) ?? [],
  };
}

export async function crearInsumo(datos: DatosInsumo): Promise<Insumo> {
  const insumo = await peticionData<Omit<Insumo, "costoPromedio"> & { costoPromedio: string }>(
    "/insumos",
    { method: "POST", body: datos },
  );
  return aInsumo(insumo);
}

export async function actualizarInsumo(id: number, datos: Partial<DatosInsumo>): Promise<Insumo> {
  const insumo = await peticionData<Omit<Insumo, "costoPromedio"> & { costoPromedio: string }>(
    `/insumos/${id}`,
    { method: "PATCH", body: datos },
  );
  return aInsumo(insumo);
}

export async function crearProducto(datos: DatosProducto): Promise<ProductoInventario> {
  const producto = await peticionData<Omit<ProductoInventario, "precio" | "receta"> & { precio: string }>(
    "/producto",
    { method: "POST", body: datos },
  );
  return aProducto(producto);
}

export async function actualizarProducto(
  id: number,
  datos: Partial<DatosProducto>,
): Promise<ProductoInventario> {
  const producto = await peticionData<Omit<ProductoInventario, "precio" | "receta"> & { precio: string }>(
    `/producto/${id}`,
    { method: "PATCH", body: datos },
  );
  return aProducto(producto);
}

export async function guardarReceta(
  productoId: number,
  ingredientes: Ingrediente[],
): Promise<RecetaIngrediente[]> {
  const producto = await peticionData<{ receta?: RecetaIngrediente[] }>("/recetas", {
    method: "POST",
    body: { productoId, ingredientes },
  });
  return producto.receta ?? [];
}

export async function setStockMinimo(datos: {
  sucursalId: number;
  insumoId: number;
  stockMinimo: number;
}): Promise<void> {
  await peticionData("/inventario/minimo", { method: "PATCH", body: datos });
}

export async function crearCategoria(nombre: string): Promise<Categoria> {
  return peticionData<Categoria>("/categorias", { method: "POST", body: { nombre } });
}

export async function actualizarCategoria(id: number, nombre: string): Promise<Categoria> {
  return peticionData<Categoria>(`/categorias/${id}`, { method: "PATCH", body: { nombre } });
}

export async function eliminarCategoria(id: number): Promise<void> {
  await peticionData(`/categorias/${id}`, { method: "DELETE" });
}
