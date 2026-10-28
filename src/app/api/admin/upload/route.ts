import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadProductImage } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Seules les images sont acceptées" },
      { status: 400 },
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image trop lourde (max 5 Mo)" },
      { status: 400 },
    );
  }

  try {
    const url = await uploadProductImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload échoué" },
      { status: 500 },
    );
  }
}
