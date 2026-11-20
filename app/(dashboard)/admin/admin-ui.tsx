"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { Icon } from "@/components/Icon";

export { Icon };
export type { IconName } from "@/components/Icon";


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
