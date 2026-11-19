export default function KpiCard({ texto, valor }: { texto: string; valor: string | number }) {
  return (
    <div className="rounded-xl border border-stone-200 border-t-4 border-t-accent bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{texto}</p>
      <p className="mt-2 text-2xl font-bold text-primary">{valor}</p>
    </div>
  );
}