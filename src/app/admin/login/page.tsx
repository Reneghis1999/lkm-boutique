import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-white/50">
          Chargement…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
