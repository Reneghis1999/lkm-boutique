import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  PRODUCT_IMAGES_BUCKET,
  getSupabaseAdmin,
} from "@/lib/supabase";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

export async function uploadProductImage(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${sanitizeFilename(ext)}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const objectPath = `products/${filename}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload Supabase: ${error.message}`);
    }

    const { data } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(objectPath);

    return data.publicUrl;
  }

  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/products/${filename}`;
}
