// app/api/cloudinary/sign/route.ts
export const runtime = "nodejs";

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // Validación de credenciales
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

    // Opcional: permitir que el frontend indique sub-folder
    const body = (await req.json().catch(() => ({}))) as { folder?: unknown };
    const folder = typeof body.folder === "string" ? body.folder : "products";

    // Timestamp actual
    const timestamp = Math.floor(Date.now() / 1000);

    // Generar la firma
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      CLOUDINARY_API_SECRET,
    );

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: CLOUDINARY_API_KEY,
      cloudName: CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (error: unknown) {
    console.error("[Cloudinary Sign Error]", error);
    return NextResponse.json(
      { error: "Error generando la firma" },
      { status: 500 },
    );
  }
}
