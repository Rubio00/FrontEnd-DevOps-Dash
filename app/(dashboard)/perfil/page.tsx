import PageHeader from "@/components/PageHeader";
import PerfilPanel from "@/components/perfil/PerfilPanel";
import { nombreCompleto, requireSessionUser } from "@/lib/session";
import { inicialesDe, normalizarRol } from "@/types/auth";
import type { UsuarioSesion } from "@/types/auth";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const user = await requireSessionUser();
  const nombre = nombreCompleto(user);

  const usuario: UsuarioSesion = {
    id: user.id,
    email: user.email,
    nombre,
    iniciales: inicialesDe(nombre),
    rol: normalizarRol(user.rol?.nombre),
    cargo: user.empleado?.puesto ?? "Sin puesto asignado",
    sucursal: user.sucursal?.nombre ?? null,
  };

  return (
    <div className="min-h-screen bg-page text-ink">
      <PageHeader titulo="Perfil" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <PerfilPanel usuario={usuario} sucursalDireccion={user.sucursal?.direccion ?? null} />
      </main>
    </div>
  );
}
