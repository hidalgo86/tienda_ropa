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

      const input: any = {};
      if (name) input.name = name;
      if (genre) {
        input.genre = /niña/i.test(genre)
          ? "NINA"
          : /niño/i.test(genre)
          ? "NINO"
          : String(genre).toUpperCase();
      }
      if (description !== null && description !== undefined)
        input.description = description;
      if (status) input.status = String(status).toUpperCase();

      // Normalizar variantes si llegan por form-data
      if (variantsStr) {
        try {
          const parsed = JSON.parse(variantsStr);
          if (!Array.isArray(parsed)) {
            return NextResponse.json(
              { error: "variants debe ser un arreglo" },
              { status: 400 }
            );
          }
          const toGraphqlSize = (s: string): string => {
            const up = String(s).toUpperCase().trim();
            const m = up.match(/^(\d+)M$/);
            if (m) return `M${m[1]}`;
            const t = up.match(/^(\d+)T$/);
            if (t) return `T${t[1]}`;
            return up;
          };
          input.variants = parsed.map((v: any) => ({
            size: toGraphqlSize(v.size),
            stock: Number(v.stock),
            price: Number(v.price),
          }));
        } catch (e: any) {
          return NextResponse.json(
            { error: `Formato inválido de variants: ${e.message}` },
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
        if (!(file as any).type || !(file as any).type.startsWith("image")) {
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

        input.imageUrl = uploadResult.secure_url;
        input.imagePublicId = uploadResult.public_id;
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

      return NextResponse.json(backendData.data.updateProduct);
    }

    // Rama JSON "application/json": actualizaciones sin imagen
    const body = (await req.json()) as UploadProduct;
    const { id, ...data } = body;
    const { createdAt, updatedAt, ...input } = data as UploadProduct & {
      createdAt?: string;
      updatedAt?: string;
    };

    if (input.status) {
      input.status = String(
        input.status
      ).toUpperCase() as UploadProduct["status"];
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

    return NextResponse.json(backendData.data.updateProduct);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
