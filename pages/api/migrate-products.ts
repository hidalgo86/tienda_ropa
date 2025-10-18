// pages/api/migrate-products.ts
// API endpoint para migrar productos desde el navegador

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    console.log("🔄 Iniciando migración de productos...");

    // Simular la migración (reemplazar con llamadas reales a tu API)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
          query {
            adminProducts(input: { pagination: { page: 1, limit: 100 } }) {
              items {
                id
                name
                description
                genre
                size
                price
                stock
                variants { size price stock }
                status
              }
            }
          }
        `,
        }),
      }
    );

    const data = await response.json();
    const products = data.data?.adminProducts?.items || [];

    console.log(`📦 Encontrados ${products.length} productos`);

    const migrations = [];

    for (const product of products) {
      // Si ya tiene variants, omitir
      if (product.variants && Array.isArray(product.variants)) {
        migrations.push({
          id: product.id,
          status: "skipped",
          reason: "Ya tiene formato nuevo",
        });
        continue;
      }

      // Si no tiene size array, omitir
      if (!product.size || !Array.isArray(product.size)) {
        migrations.push({
          id: product.id,
          status: "skipped",
          reason: "No tiene datos de tallas",
        });
        continue;
      }

      // Crear variants
      const variants = product.size.map((size: string) => ({
        size: size,
        price: product.price || 0,
        stock: product.stock || 0,
      }));

      migrations.push({
        id: product.id,
        name: product.name,
        status: "pending",
        oldFormat: {
          size: product.size,
          price: product.price,
          stock: product.stock,
        },
        newVariants: variants,
      });
    }

    res.status(200).json({
      message: "Análisis de migración completado",
      total: products.length,
      toMigrate: migrations.filter((m) => m.status === "pending").length,
      toSkip: migrations.filter((m) => m.status === "skipped").length,
      migrations,
    });
  } catch (error) {
    console.error("Error en migración:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
