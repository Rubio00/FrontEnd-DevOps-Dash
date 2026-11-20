import PosClient from "./pos-client";
import { requireSessionUser } from "@/lib/session";
import {
  getCajaAbierta,
  getCatalogoPos,
  getClientesPos,
  getMetodosPago,
  getVentasRecientes,
} from "@/services/pos";
import { getSucursales } from "@/services/sucursales";

export const dynamic = "force-dynamic";

export default async function VentasPage() {
  const user = await requireSessionUser();
  const sucursales = await getSucursales();
  const sucursalId = user.sucursalId ?? sucursales[0]?.id;

  if (!sucursalId) {
    return (
      <main className="min-h-screen bg-page p-8 text-ink">
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Tu usuario no tiene sucursal asignada. Pedile al administrador que te asigne una para usar el POS.
        </p>
      </main>
    );
  }

  const [productos, clientes, metodos, caja, ventas] = await Promise.all([
    getCatalogoPos(),
    getClientesPos(),
    getMetodosPago(),
    getCajaAbierta(sucursalId),
    getVentasRecientes(sucursalId),
  ]);

  return (
    <PosClient
      usuarioId={user.id}
      sucursalId={sucursalId}
      sucursalNombre={sucursales.find((sucursal) => sucursal.id === sucursalId)?.nombre ?? ""}
      productos={productos}
      clientes={clientes}
      metodos={metodos}
      cajaInicial={caja}
      ventasIniciales={ventas}
    />
  );
}
