import type { Metadata } from "next";
import InventoryDashboard from "./inventory-dashboard";
import { requireSessionUser } from "@/lib/session";
import {
  getCatalogoInsumos,
  getCategorias,
  getMovimientos,
  getProductosInventario,
  getStock,
} from "@/services/inventario";
import { getProveedores } from "@/services/proveedores";
import { getSucursales } from "@/services/sucursales";
import { normalizarRol } from "@/types/auth";

export const metadata: Metadata = {
  title: "Inventario | Orígenes SV",
  description: "Control de existencias, recetas y movimientos de inventario.",
};

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const user = await requireSessionUser();
  const rol = normalizarRol(user.rol?.nombre);
  const puedeEditar = rol === "admin" || rol === "gerente";

  const [stock, movimientos, insumos, productos, categorias, sucursales, proveedores] =
    await Promise.all([
      getStock(),
      getMovimientos(),
      getCatalogoInsumos(),
      getProductosInventario(),
      getCategorias(),
      getSucursales(),
      // Los proveedores solo se usan en el formulario de alta (admin/gerente).
      puedeEditar ? getProveedores() : Promise.resolve([]),
    ]);

  return (
    <InventoryDashboard
      inicialStock={stock}
      inicialMovimientos={movimientos}
      inicialInsumos={insumos}
      inicialProductos={productos}
      inicialCategorias={categorias}
      sucursales={sucursales.map((sucursal) => ({ id: sucursal.id, nombre: sucursal.nombre }))}
      proveedores={proveedores
        .filter((proveedor) => proveedor.activo)
        .map((proveedor) => ({ id: proveedor.id, nombre: proveedor.nombre }))}
      sucursalInicial={user.sucursalId ?? sucursales[0]?.id ?? 1}
      puedeEditar={puedeEditar}
    />
  );
}
