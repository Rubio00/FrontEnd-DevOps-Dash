import type { Metadata } from "next";
import InicioDashboard from "@/components/inicio/InicioDashboard";
import { nombreCompleto, requireSessionUser } from "@/lib/session";
import { inicialesDe, normalizarRol } from "@/types/auth";
import type { UsuarioSesion } from "@/types/auth";

export const metadata: Metadata = {
  title: "Inicio | Orígenes SV",
  description: "Menú principal con acceso a los módulos según el rol del usuario.",
};

export default async function InicioPage() {
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

  return <InicioDashboard usuario={usuario} />;
}

