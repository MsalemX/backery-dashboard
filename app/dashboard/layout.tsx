import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-row-reverse">
        {/* Sidebar (Fixed on the right for RTL) */}
        <Sidebar />

        {/* Main Content (Shifted to the left) */}
        <main className="flex-1 mr-64 min-h-screen">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
