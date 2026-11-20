"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/components/Icon";

type Item = { href: string; label: string; icon: IconName; badge?: string };

const items: Item[] = [
  { href: "/inicio", label: "Inicio", icon: "home" },
  { href: "/ventas", label: "Ventas", icon: "menu", badge: "POS" },
  { href: "/balance", label: "Balance de ventas", icon: "chart" },
  { href: "/inventario", label: "Inventario", icon: "menu", badge: "STOCK" },
  { href: "/compras", label: "Compras", icon: "wallet" },
  { href: "/proveedores", label: "Proveedores", icon: "truck" },
  { href: "/planilla", label: "Planilla", icon: "payroll" },
  { href: "/sucursales", label: "Sucursales", icon: "branch" }, // descomentar cuando se una la rama de sucursales
  { href: "/admin", label: "Administración", icon: "users" },
    { href: "/perfil", label: "Perfil", icon: "user" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col bg-sidebar text-[#F8F0E5] lg:fixed lg:inset-y-0 lg:w-64">
      <div className="border-b border-white/10 px-6 py-7">
        <Link href="/inicio" className="flex w-fit items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B58A60] text-white">
            <Icon name="store" className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-wide">ORÍGENES SV</span>
            <span className="block text-xs text-[#C9B7A4]">Sistema de gestión</span>
          </span>
        </Link>
      </div>

      <div className="px-5 py-7">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A99583]">Menú principal</p>
        <nav aria-label="Módulos principales" className="space-y-2">
          {items.map((item) => {
            const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#B58A60] ${
                  activo ? "bg-[#8B6347] font-medium text-white" : "text-[#C9B7A4] hover:bg-white/10"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
                {item.badge && <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-xs">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto hidden border-t border-white/10 p-5 lg:block">
        <p className="text-sm font-medium">Restaurante Orígenes</p>
        <p className="mt-1 text-xs text-[#A99583]">El Salvador</p>
      </div>
    </aside>
  );
}