import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] });

export default function PageHeader({ titulo }: { titulo: string }) {
  return (
    <header className="bg-primary px-8 py-10 text-center text-white shadow">
      <h1 className={`${playfair.className} text-5xl font-bold tracking-wide`}>Orígenes SV</h1>
      <div className="mx-auto mt-4 h-0.5 w-16 bg-accent" />
      <p className="mt-4 text-sm font-medium uppercase tracking-[0.3em] text-accent">{titulo}</p>
    </header>
  );
}