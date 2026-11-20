import AdminDashboard from "./admin-dashboard";
import { getRoles, getUsuarios } from "@/services/admin";
import { getEmpleados } from "@/services/empleados";
import { getSucursales } from "@/services/sucursales";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [usuarios, roles, empleados, sucursales] = await Promise.all([
    getUsuarios(),
    getRoles(),
    getEmpleados(),
    getSucursales(),
  ]);

  return (
    <AdminDashboard
      usuarios={usuarios}
      roles={roles}
      empleados={empleados}
      sucursales={sucursales.map((sucursal) => ({ id: sucursal.id, nombre: sucursal.nombre }))}
    />
  );
}
