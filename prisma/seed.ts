import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import catalog from "../src/data/catalog.json";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@lkmboutique.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "LkmAdmin2026!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: "Admin LKM" },
    create: {
      email,
      name: "Admin LKM",
      passwordHash,
      role: "admin",
    },
  });
  console.log(`Admin prêt : ${email}`);

  for (const [index, category] of catalog.categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        shortName: category.shortName,
        description: category.description || "",
        icon: category.icon,
        accent: category.accent,
        group: category.group,
        sourceName: category.sourceName || "",
        position: index,
      },
      create: {
        slug: category.slug,
        name: category.name,
        shortName: category.shortName,
        description: category.description || "",
        icon: category.icon,
        accent: category.accent,
        group: category.group,
        sourceName: category.sourceName || "",
        position: index,
      },
    });
  }
  console.log(`${catalog.categories.length} catégories`);

  const allCategories = await prisma.category.findMany();
  const categoryBySlug = new Map(allCategories.map((c) => [c.slug, c.id]));

  let productCount = 0;
  for (const product of catalog.products) {
    const categoryIds = (product.categorySlugs || [])
      .map((slug: string) => categoryBySlug.get(slug))
      .filter(Boolean) as string[];

    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        description: product.description || "",
        image: product.image,
        specsJson: JSON.stringify(product.specs || []),
        optionsJson: JSON.stringify(product.options || []),
        featured: Boolean(product.featured),
        active: true,
        position: product.position ?? 0,
      },
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        description: product.description || "",
        image: product.image,
        specsJson: JSON.stringify(product.specs || []),
        optionsJson: JSON.stringify(product.options || []),
        featured: Boolean(product.featured),
        active: true,
        position: product.position ?? 0,
      },
    });

    await prisma.productCategory.deleteMany({ where: { productId: saved.id } });
    if (categoryIds.length) {
      await prisma.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          productId: saved.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }
    productCount += 1;
  }

  console.log(`${productCount} produits synchronisés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
