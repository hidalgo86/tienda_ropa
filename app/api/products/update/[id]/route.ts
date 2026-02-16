export const runtime = "nodejs";
import { UploadProduct } from "@/types/product.type";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Rama multipart/form-data: permite actualizar con imagen
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const id = formData.get("id") as string | null;
      if (!id) {
        return NextResponse.json({ error: "ID requerido" }, { status: 400 });
      }

      const file = formData.get("image") as File | null;
      const oldImagePublicId = formData.get("oldImagePublicId") as
        | string
        | null;
      const name = formData.get("name") as string | null;
      const genre = formData.get("genre") as string | null;
      const description = formData.get("description") as string | null;
      const status = formData.get("status") as string | null;
      const variantsStr = formData.get("variants") as string | null; // JSON opcional

      type UpdateProductInput = {
        name?: string;
        genre?: "NINO" | "NINA" | "UNISEX";
        description?: string | null;
        status?: string;
        variants?: Array<{ size: string; stock: number; price: number }>;
        imageUrl?: string;
        imagePublicId?: string;
      };
      const input: UpdateProductInput = {};
      if (name) input.name = name;
      if (genre) {
        const g = /niña/i.test(genre)
          ? "NINA"
          : /niño/i.test(genre)
          ? "NINO"
          : String(genre).toUpperCase();
        if (g === "NINA" || g === "NINO" || g === "UNISEX") {
          input.genre = g;
        }
      }
      if (description !== null && description !== undefined)
        input.description = description;
      if (status) input.status = String(status).toUpperCase();

      // Normalizar variantes si llegan por form-data
      if (variantsStr) {
        try {
          const parsedUnknown: unknown = JSON.parse(variantsStr);
          if (!Array.isArray(parsedUnknown)) {
            return NextResponse.json(
              { error: "variants debe ser un arreglo" },
              { status: 400 }
            );
          }
          const isVariant = (
            v: unknown
          ): v is { size: string; stock: number; price: number } =>
            !!v &&
            typeof (v as { size: unknown }).size === "string" &&
            typeof (v as { stock: unknown }).stock === "number" &&
            typeof (v as { price: unknown }).price === "number";
          const toGraphqlSize = (s: string): string => {
            const up = String(s).toUpperCase().trim();
            const m = up.match(/^(\d+)M$/);
            if (m) return `M${m[1]}`;
            const t = up.match(/^(\d+)T$/);
            if (t) return `T${t[1]}`;
            return up;
          };
          input.variants = (parsedUnknown as unknown[])
            .filter(isVariant)
            .map((v) => ({
              size: toGraphqlSize((v as { size: string }).size),
              stock: Number((v as { stock: number }).stock),
              price: Number((v as { price: number }).price),
            }));
        } catch (e: unknown) {
          const message =
            e && typeof e === "object" && "message" in e
              ? String((e as { message?: unknown }).message ?? "")
              : "";
          return NextResponse.json(
            { error: `Formato inválido de variants: ${message}` },
            { status: 400 }
          );
        }
      }

      // Si llega imagen nueva, exigir oldImagePublicId, eliminar y subir
      if (file) {
        if (
          !process.env.CLOUDINARY_CLOUD_NAME ||
          !process.env.CLOUDINARY_API_KEY ||
          !process.env.CLOUDINARY_API_SECRET
        ) {
          return NextResponse.json(
            {
              error:
                "Faltan credenciales de Cloudinary en variables de entorno",
            },
            { status: 500 }
          );
        }
        if (!file.type || !file.type.startsWith("image")) {
          return NextResponse.json(
            { error: "El archivo debe ser una imagen válida" },
            { status: 400 }
          );
        }
        if (!oldImagePublicId) {
          return NextResponse.json(
            {
              error:
                "oldImagePublicId requerido cuando se envía una nueva imagen",
            },
            { status: 400 }
          );
        }

        // Eliminar imagen anterior (si falla, continuar y registrar)
        try {
          await new Promise<void>((resolve, reject) => {
            cloudinary.uploader.destroy(
              oldImagePublicId,
              { resource_type: "image" },
              (error) => {
                if (error) reject(error);
                else resolve();
              }
            );
          });
        } catch (err) {
          console.warn(
            "[updateProduct] No se pudo eliminar imagen previa:",
            err
          );
        }

        // Subir nueva imagen
        const buffer = Buffer.from(await file.arrayBuffer());
        interface CloudinaryUploadResult {
          secure_url: string;
          public_id: string;
          [key: string]: unknown;
        }
        const uploadResult = await new Promise<CloudinaryUploadResult>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: "products", resource_type: "image" },
                (error, result) => {
                  if (error) reject(error);
                  else if (result) resolve(result as CloudinaryUploadResult);
                  else reject(new Error("Cloudinary upload failed"));
                }
              )
              .end(buffer);
          }
        );

        input.imageUrl = uploadResult.secure_url;
        input.imagePublicId = uploadResult.public_id;
      }

      if (Object.keys(input).length === 0) {
        return NextResponse.json(
          { error: "No hay campos para actualizar" },
          { status: 400 }
        );
      }

      // Ajustar status automáticamente según stock total si hay variantes
      if (Array.isArray(input.variants)) {
        const totalStock = input.variants.reduce(
          (sum, v) => sum + (Number(v?.stock) || 0),
          0
        );
        input.status = totalStock > 0 ? "DISPONIBLE" : "AGOTADO";
      }

      if (!process.env.API_URL) {
        return NextResponse.json(
          { error: "Falta API_URL en variables de entorno" },
          { status: 500 }
        );
      }

      const graphqlQuery = {
        query: `
          mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
            updateProduct(id: $id, input: $input) {
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
        variables: { id, input },
      };

      const backendRes = await fetch(process.env.API_URL + "/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(graphqlQuery),
      });

      type GraphqlError = { message?: string };
      type GraphqlResponse<T> = { data?: T; errors?: GraphqlError[] };
      let backendData: GraphqlResponse<{ updateProduct: unknown }> | null =
        null;
      try {
        backendData = (await backendRes.json()) as GraphqlResponse<{
          updateProduct: unknown;
        }>;
      } catch {
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

      if (!backendData.data?.updateProduct) {
        return NextResponse.json(
          { error: "Respuesta inválida del backend" },
          { status: 500 }
        );
      }
      return NextResponse.json(backendData.data.updateProduct);
    }

    // Rama JSON "application/json": actualizaciones sin imagen
    const body = (await req.json()) as UploadProduct;
    const { id, ...data } = body;
    const input: Partial<UploadProduct> = { ...data };
    // Remove server-managed fields to avoid sending them
    const inputKeys = input as Record<string, unknown>;
    delete inputKeys.createdAt;
    delete inputKeys.updatedAt;

    // Si se proporcionan variantes, ajustar status automáticamente según stock.
    if (Array.isArray(input.variants)) {
      const totalStock = input.variants.reduce(
        (sum, v) => sum + (Number(v?.stock) || 0),
        0
      );
      input.status = (
        totalStock > 0 ? "DISPONIBLE" : "AGOTADO"
      ) as unknown as UploadProduct["status"];
    } else if (input.status) {
      // Normalización si viene explícito
      input.status = String(input.status).toUpperCase() as UploadProduct["status"];
    }

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    if (Object.keys(input).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    if (!process.env.API_URL) {
      return NextResponse.json(
        { error: "Falta API_URL en variables de entorno" },
        { status: 500 }
      );
    }

    const graphqlQuery = {
      query: `
        mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
          updateProduct(id: $id, input: $input) {
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
      variables: { id, input },
    };

    const backendRes = await fetch(process.env.API_URL + "/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery),
    });

    type GraphqlError = { message?: string };
    type GraphqlResponse<T> = { data?: T; errors?: GraphqlError[] };
    let backendData: GraphqlResponse<{ updateProduct: unknown }> | null = null;
    try {
      backendData = (await backendRes.json()) as GraphqlResponse<{
        updateProduct: unknown;
      }>;
    } catch {
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

    if (!backendData.data?.updateProduct) {
      return NextResponse.json(
        { error: "Respuesta inválida del backend" },
        { status: 500 }
      );
    }
    return NextResponse.json(backendData.data.updateProduct);
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "Error interno")
        : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
