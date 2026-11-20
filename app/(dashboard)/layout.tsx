import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-page text-ink">
      <Sidebar />
      <div className="min-w-0 lg:ml-64">{children}</div>
    </div>
  );
}