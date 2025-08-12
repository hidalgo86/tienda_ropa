// pages/api/cloudinary-signature.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + CLOUDINARY_API_SECRET)
    .digest("hex");

  res.status(200).json({
    signature,
    timestamp,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  });
}
