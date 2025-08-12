// pages/api/delete-cloudinary-image.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const { public_id } = req.body;
  if (!public_id) {
    return res.status(400).json({ error: "Falta public_id" });
  }
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    res.status(200).json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
