// scripts/migrate-products.js
// Script para migrar productos del formato viejo al nuevo

import {
  getAdminProducts,
  updateProduct,
} from "../services/products.services.js";

async function migrateProducts() {
  console.log("🔄 Iniciando migración de productos...");

  try {
    // Obtener todos los productos (incluyendo eliminados)
    const { items: products } = await getAdminProducts(1, 100);
    console.log(`📦 Encontrados ${products.length} productos`);

    let migrated = 0;
    let skipped = 0;

    for (const product of products) {
      console.log(`\n🔍 Procesando: ${product.name} (${product.id})`);

      // Verificar si ya tiene el formato nuevo
      if (product.variants && Array.isArray(product.variants)) {
        console.log("   ✅ Ya tiene formato nuevo - omitido");
        skipped++;
        continue;
      }

      // Verificar si tiene datos del formato viejo
      if (!product.size || !Array.isArray(product.size)) {
        console.log("   ⚠️ No tiene datos de tallas - omitido");
        skipped++;
        continue;
      }

      // Crear variants desde el formato viejo
      const variants = product.size.map((size) => ({
        size: size,
        price: product.price || 0,
        stock: product.stock || 0,
      }));

      console.log(`   🔧 Creando ${variants.length} variants:`, variants);

      // Actualizar el producto con el nuevo formato
      const updatePayload = {
        name: product.name,
        description: product.description,
        genre: product.genre,
        variants: variants,
      };

      try {
        const updated = await updateProduct(product.id, updatePayload);
        console.log("   ✅ Migrado exitosamente");
        migrated++;
      } catch (error) {
        console.error(`   ❌ Error migrando: ${error.message}`);
      }
    }

    console.log(`\n🎉 Migración completada:`);
    console.log(`   ✅ Migrados: ${migrated}`);
    console.log(`   ⏭️ Omitidos: ${skipped}`);
    console.log(`   📊 Total: ${products.length}`);
  } catch (error) {
    console.error("💥 Error durante la migración:", error);
  }
}

// Ejecutar migración
migrateProducts();
