import { NextResponse } from "next/server";
import { clearAuthCookies } from "../../_utils/security";

export async function POST() {
  const response = NextResponse.json({ message: "Sesion cerrada" });
  clearAuthCookies(response);
  return response;
}
