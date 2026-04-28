export const runtime = "nodejs";

import { v2 as cloudinary } from "cloudinary";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { executeUsersGraphql } from "../../users/graphqlClient";
import { UserApiRouteError } from "../../users/userApi.error";
import { getBackendAuthorization } from "../../_utils/security";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_FOLDERS = new Set(["products", "banners"]);

const meQuery = `
  query Me {
    me {
      role
    }
  }
`;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isAdminRole = (role?: unknown): boolean =>
  typeof role === "string" && role.trim().toLowerCase() === "administrador";

const assertAdminUser = async (req: NextRequest): Promise<void> => {
  const authorization = getBackendAuthorization(req);

  if (!authorization) {
    throw new UserApiRouteError("Debes iniciar sesion", 401);
  }

  const data = await executeUsersGraphql<{ me: { role?: unknown } }>({
    query: meQuery,
    request: req,
  });

  if (!isAdminRole(data.me?.role)) {
    throw new UserApiRouteError("No tienes permisos para subir imagenes", 403);
  }
};

const normalizeFolder = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string") return "products";

  const folder = value.trim().toLowerCase();
  return ALLOWED_FOLDERS.has(folder) ? folder : "products";
};

const hasAllowedImageSignature = (buffer: Buffer): boolean => {
  const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPng =
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const header = buffer.subarray(0, 12).toString("ascii");
  const isWebp = header.startsWith("RIFF") && header.includes("WEBP");

  return isJpeg || isPng || isWebp;
};

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

export async function POST(req: NextRequest) {
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

    await assertAdminUser(req);

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = normalizeFolder(formData.get("folder"));

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Debes enviar un archivo válido" },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen JPG, PNG o WEBP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "La imagen no puede superar 5 MB" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!hasAllowedImageSignature(buffer)) {
      return NextResponse.json(
        { error: "El contenido del archivo no parece una imagen valida" },
        { status: 400 },
      );
    }

    const uploadedImage = await uploadBufferToCloudinary(buffer, folder);

    return NextResponse.json({
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    });
  } catch (error: unknown) {
    console.error("[Cloudinary Upload Error]", error);
    return NextResponse.json(
      {
        error: "Error subiendo imagen",
      },
      { status: error instanceof UserApiRouteError ? error.status : 500 },
    );
  }
}
