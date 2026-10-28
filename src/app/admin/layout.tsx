import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLogin =
    typeof children === "object" &&
    // login page still uses this layout; detect via session absence on login is fine
    true;

  // Login page: no shell
  // We check path via headers would be cleaner; simpler: if no session, render children only
  if (!session?.user) {
    return <>{children}</>;
  }

  void isLogin;

  return (
    <div className="min-h-screen bg-[var(--lkm-bg)] text-white lg:flex">
      <AdminNav userName={session.user.name} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
