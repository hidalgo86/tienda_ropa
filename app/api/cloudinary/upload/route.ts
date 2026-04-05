export const runtime = "nodejs";

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error || new Error("Respuesta inválida de Cloudinary"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });

export async function POST(req: Request) {
  try {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;
    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Faltan credenciales de Cloudinary en variables de entorno" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folderValue = formData.get("folder");
    const folder =
      typeof folderValue === "string" && folderValue.trim()
        ? folderValue.trim()
        : "products";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Debes enviar un archivo válido" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadedImage = await uploadBufferToCloudinary(buffer, folder);

    return NextResponse.json({
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    });
  } catch (error: unknown) {
    console.error("[Cloudinary Upload Error]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error subiendo imagen",
      },
      { status: 500 },
    );
  }
}
