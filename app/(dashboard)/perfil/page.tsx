import PageHeader from "@/components/PageHeader";
import PerfilPanel from "@/components/perfil/PerfilPanel";

export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <PageHeader titulo="Perfil" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <PerfilPanel />
      </main>
    </div>
  );
}