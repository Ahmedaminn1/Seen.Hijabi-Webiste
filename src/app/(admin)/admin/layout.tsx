import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "لوحة التحكم الإدارية | Seen Hijabi Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
