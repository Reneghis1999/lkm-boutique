import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** « Livré avec garantie — votre facture vous est remise après l’achat. » */
export function GuaranteeNote({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center justify-center gap-1.5 text-xs text-[#3ddc8a]", className)}>
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
      Livré avec garantie — votre facture vous est remise après l’achat.
    </p>
  );
}
