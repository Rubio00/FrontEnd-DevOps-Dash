import type { Metadata } from "next";
import InventoryDashboard from "./inventory-dashboard";

export const metadata: Metadata = {
  title: "Inventario | Orígenes SV",
  description: "Control de existencias, recetas y movimientos de inventario.",
};

export default function InventoryPage() {
  return <InventoryDashboard />;
}
