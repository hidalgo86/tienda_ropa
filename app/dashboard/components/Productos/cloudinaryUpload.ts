// Utilidad para subir imágenes a Cloudinary desde el frontend
// Reemplaza <tu_cloud_name> y <tu_upload_preset> por los valores de tu cuenta Cloudinary

// Utilidad para subir imágenes a Cloudinary con firma (signed upload)
// Llama primero a la API local /api/cloudinary-signature para obtener la firma

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

export async function uploadToCloudinary(
  file: File
): Promise<{ secure_url: string; public_id: string }> {
  // 1. Solicitar firma al backend
  const sigRes = await fetch("/api/cloudinary-signature", { method: "POST" });
  if (!sigRes.ok) throw new Error("No se pudo obtener la firma de Cloudinary");
  const { signature, timestamp, apiKey, cloudName } =
    (await sigRes.json()) as CloudinarySignature;

  // 2. Subir imagen a Cloudinary usando la firma
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir imagen a Cloudinary");
  const data = await res.json();
  console.log("Imagen subida a Cloudinary:", data);
  return { secure_url: data.secure_url, public_id: data.public_id };
}
