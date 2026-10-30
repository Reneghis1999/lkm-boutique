import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#09090c] text-[#f5f5f7]">{children}</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090c] text-[#f5f5f7] lg:flex">
      <AdminNav userName={session.user.name} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
