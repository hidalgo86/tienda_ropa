export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import type {
  CreateProduct,
  VariantProduct,
  Size,
  Genre,
} from "@/types/product.type";

// Configura Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Leer el form-data
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const name = formData.get("name") as string;
    const genre = formData.get("genre") as string;
    const description = formData.get("description") as string | undefined;
    const variants = formData.get("variants") as string; // JSON string

    // Validación de variables de entorno requeridas
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Faltan credenciales de Cloudinary en variables de entorno" },
        { status: 500 }
      );
    }

    if (!process.env.NEST_GRAPHQL_URL) {
      return NextResponse.json(
        { error: "Falta NEST_GRAPHQL_URL en variables de entorno" },
        { status: 500 }
      );
    }

    if (!file || !name || !genre || !variants) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Validar que el archivo sea una imagen
    if (!(file as any).type || !(file as any).type.startsWith("image")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen válida" },
        { status: 400 }
      );
    }

    // Validar y parsear variantes
    let parsedVariants: any;
    try {
      parsedVariants = JSON.parse(variants);
      if (!Array.isArray(parsedVariants)) {
        throw new Error("variants debe ser un arreglo");
      }
      // Debe contener al menos una variante
      if (parsedVariants.length === 0) {
        return NextResponse.json(
          { error: "variants debe contener al menos una variante" },
          { status: 400 }
        );
      }
      // Validar estructura mínima de cada variante
      const isValidVariant = (v: any) =>
        v &&
        typeof v.size === "string" &&
        typeof v.stock === "number" &&
        v.stock >= 0 &&
        typeof v.price === "number" &&
        v.price >= 0;
      const allValid = parsedVariants.every(isValidVariant);
      if (!allValid) {
        return NextResponse.json(
          {
            error:
              "Cada variante debe incluir size (string), stock (>=0) y price (>=0)",
          },
          { status: 400 }
        );
      }
    } catch (e: any) {
      return NextResponse.json(
        { error: `Formato inválido de variants: ${e.message}` },
        { status: 400 }
      );
    }

    // Subir imagen a Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "products", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    // Construir el input para el backend
    // Normalizar género a enum GraphQL (NINO, NINA, UNISEX)
    const normalize = (s: string) =>
      s
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const genreMap: Record<string, string> = {
      NINO: "NINO",
      NINA: "NINA",
      UNISEX: "UNISEX",
      NIÑO: "NINO",
      NIÑA: "NINA",
    };

    const normalizedGenreKey = normalize(genre);
    const mappedGenre = genreMap[normalizedGenreKey] || normalizedGenreKey;
    const allowedGenres = new Set(["NINO", "NINA", "UNISEX"]);
    if (!allowedGenres.has(mappedGenre)) {
      return NextResponse.json(
        {
          error: `Género inválido: ${genre}. Valores permitidos: NINO, NINA, UNISEX`,
        },
        { status: 400 }
      );
    }

    // Normalizar tallas de variantes al enum GraphQL
    const normalizeSize = (s: string) => {
      const up = s.toUpperCase().trim();
      // 10T -> T10, 2T -> T2, etc.
      const tSuffix = up.match(/^(\d+)T$/);
      if (tSuffix) return `T${tSuffix[1]}`;
      // 3M -> M3, 12M -> M12, etc.
      const mSuffix = up.match(/^(\d+)M$/);
      if (mSuffix) return `M${mSuffix[1]}`;
      // Ya en formato M3, M6, etc.
      if (/^M\d+$/.test(up)) return up;
      return up;
    };

    // Ajuste al tipado del cliente: tallas en formato RN, 3M, 6M, ..., 2T-12T
    const allowedClientSizes = new Set<string>([
      "RN",
      "3M",
      "6M",
      "9M",
      "12M",
      "18M",
      "24M",
      "2T",
      "3T",
      "4T",
      "5T",
      "6T",
      "7T",
      "8T",
      "9T",
      "10T",
      "12T",
    ]);

    const toClientSize = (s: string): string => {
      const up = s.toUpperCase().trim();
      const mPref = up.match(/^M(\d+)$/);
      if (mPref) return `${mPref[1]}M`;
      const mSuf = up.match(/^(\d+)M$/);
      if (mSuf) return up;
      const tPref = up.match(/^T(\d+)$/);
      if (tPref) return `${tPref[1]}T`;
      const tSuf = up.match(/^(\d+)T$/);
      if (tSuf) return up;
      if (up === "RN") return up;
      return up;
    };

    const typedVariants: VariantProduct[] = parsedVariants.map((v: any) => {
      const clientSize = toClientSize(String(v.size));
      const stockNum = Number(v.stock);
      const priceNum = Number(v.price);
      return {
        size: clientSize as Size,
        stock: stockNum,
        price: priceNum,
      };
    });

    if (!typedVariants.every((v) => allowedClientSizes.has(v.size))) {
      return NextResponse.json(
        {
          error:
            "Talla inválida en variants. Usa RN, 3M, 6M, 9M, 12M, 18M, 24M, 2T-12T.",
        },
        { status: 400 }
      );
    }

    // Construir objeto tipado según CreateProduct
    const typedProduct: CreateProduct = {
      id: "",
      name,
      genre: (/niña/i.test(genre)
        ? "NINA"
        : /niño/i.test(genre)
        ? "NINO"
        : "UNISEX") as Genre,
      description,
      variants: typedVariants,
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
    };

    // Log en desarrollo para verificar payload tipado
    if (process.env.NODE_ENV !== "production") {
      console.log("[createProduct] Typed Input:", {
        name: typedProduct.name,
        genre: typedProduct.genre,
        description: typedProduct.description,
        variants: typedProduct.variants,
        imageUrl: typedProduct.imageUrl,
        imagePublicId: typedProduct.imagePublicId,
      });
    }

    // Mapear al formato GraphQL esperado
    const toGraphqlSize = (s: string): string => {
      const m = s.match(/^(\d+)M$/);
      if (m) return `M${m[1]}`;
      const t = s.match(/^(\d+)T$/);
      if (t) return `T${t[1]}`;
      return s;
    };

    const graphqlVariants = (typedProduct.variants || []).map((v) => ({
      size: toGraphqlSize(String(v.size)),
      stock: Number(v.stock),
      price: Number(v.price),
    }));

    const graphqlGenreMap: Record<string, string> = {
      NINO: "NINO",
      NINA: "NINA",
      UNISEX: "UNISEX",
    };

    const productInput = {
      name: typedProduct.name,
      genre: graphqlGenreMap[typedProduct.genre],
      description: typedProduct.description,
      variants: graphqlVariants,
      imageUrl: typedProduct.imageUrl,
      imagePublicId: typedProduct.imagePublicId,
    };

    // Enviar a NestJS por GraphQL
    const graphqlQuery = {
      query: `
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
            id
            name
            genre
            description
            imageUrl
            imagePublicId
            variants { size stock price }
            status
          }
        }
      `,
      variables: { input: productInput },
    };

    const backendRes = await fetch(process.env.API_URL + "/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery),
    });

    console.log("Backend response status:", backendRes);
    let backendData: any = null;
    try {
      backendData = await backendRes.json();
    } catch (e) {
      const text = await backendRes.text();
      return NextResponse.json(
        {
          error: "Respuesta inválida del backend",
          status: backendRes.status,
          body: text,
        },
        { status: 500 }
      );
    }

    if (!backendRes.ok || backendData?.errors) {
      return NextResponse.json(
        {
          error: backendData?.errors || backendData,
          status: backendRes.status,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(backendData.data.createProduct);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
