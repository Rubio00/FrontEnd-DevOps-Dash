"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export type IconName =
  | "alert"
  | "check"
  | "close"
  | "employees"
  | "eye"
  | "lock"
  | "menu"
  | "plus"
  | "roles"
  | "search"
  | "store"
  | "users"
  | "wallet";

const iconPaths: Record<IconName, string> = {
  alert: "M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z M12 9v4 M12 17h.01",
  check: "M20 6 9 17l-5-5",
  close: "M18 6 6 18 M6 6l12 12",
  employees: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4 M12 15v2",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  plus: "M12 5v14 M5 12h14",
  roles: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-4",
  search: "M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  store: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22V12h6v10",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wallet: "M3 6h16a2 2 0 0 1 2 2v11H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14 M16 12h5",
};

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section
        aria-describedby="admin-modal-description"
        aria-labelledby="admin-modal-title"
        aria-modal="true"
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between border-b border-primary/10 px-6 py-5">
          <div>
            <h2 id="admin-modal-title" className="text-xl font-bold text-primary">{title}</h2>
            <p id="admin-modal-description" className="mt-1 text-sm leading-6 text-muted">{description}</p>
          </div>
          <button aria-label="Cerrar ventana" className="rounded-lg p-2 text-ink/50 transition hover:bg-page hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-[#E9D8C5] font-bold text-[#67452F] ${large ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm"}`}>
      {initials}
    </span>
  );
}

export function StatusBadge({ active, activeLabel = "Activo", inactiveLabel = "Inactivo" }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${active ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-stone-100 text-stone-600 ring-stone-500/20"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export const inputClassName = "mt-2 w-full rounded-xl border border-primary/15 bg-white px-3 py-3 text-sm font-normal outline-none placeholder:text-ink/30 focus:border-accent focus:ring-2 focus:ring-accent/20";
export const secondaryButtonClassName = "rounded-xl border border-primary/15 px-4 py-2.5 text-sm font-bold text-ink/60 transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-accent";
export const primaryButtonClassName = "rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent";
