export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getBackendAuthorization } from "../../_utils/security";

const query = `
  query AdminBanners {
    adminBanners {
      id
      title
      imageUrl
      imagePublicId
      altText
      subtitle
      linkUrl
      ctaLabel
      order
      isActive
      startsAt
      endsAt
      createdAt
      updatedAt
    }
  }
`;

const mutation = `
  mutation CreateBanner($input: CreateBannerInput!) {
    createBanner(input: $input) {
      id
      title
      imageUrl
      imagePublicId
      altText
      subtitle
      linkUrl
      ctaLabel
      order
      isActive
      startsAt
      endsAt
      createdAt
      updatedAt
    }
  }
`;

export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL?.trim();

  if (!apiUrl) {
    return NextResponse.json({ error: "Falta API_URL" }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getBackendAuthorization(req)
          ? { Authorization: getBackendAuthorization(req) as string }
          : {}),
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    const payload = await response.json();

    if (!response.ok || payload.errors) {
      throw new Error(payload.errors?.[0]?.message || "Error al cargar banners");
    }

    return NextResponse.json(payload.data?.adminBanners ?? []);
  } catch {
    return NextResponse.json(
      {
        error:
          "Error al cargar banners",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.API_URL?.trim();

  if (!apiUrl) {
    return NextResponse.json({ error: "Falta API_URL" }, { status: 500 });
  }

  try {
    const input = await req.json();

    const response = await fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getBackendAuthorization(req)
          ? { Authorization: getBackendAuthorization(req) as string }
          : {}),
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input },
      }),
    });

    const payload = await response.json();

    if (!response.ok || payload.errors) {
      throw new Error(payload.errors?.[0]?.message || "Error al crear banner");
    }

    return NextResponse.json(payload.data?.createBanner);
  } catch {
    return NextResponse.json(
      {
        error: "Error al crear banner",
      },
      { status: 500 },
    );
  }
}
