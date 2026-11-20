import type { Metadata } from "next";
import InicioDashboard from "@/components/inicio/InicioDashboard";

export const metadata: Metadata = {
  title: "Inicio | Orígenes SV",
  description: "Menú principal con acceso a los módulos según el rol del usuario.",
};

export default function InicioPage() {
  return <InicioDashboard />;
}
