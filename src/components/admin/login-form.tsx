"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push(params.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--lkm-bg)] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-8 shadow-xl"
      >
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-lkm-full.png"
            alt="LKM Boutique"
            width={180}
            height={180}
            priority
            className="h-28 w-auto object-contain"
          />
        </div>
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          Back-office
        </p>
        <h1 className="mt-3 text-center font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Connexion
        </h1>
        <p className="mt-2 text-center text-sm text-white/50">
          Accès réservé à l’équipe boutique.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">
              Mot de passe
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
        </div>
      </form>
    </div>
  );
}
