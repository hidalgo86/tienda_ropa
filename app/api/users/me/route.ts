import { NextRequest, NextResponse } from "next/server";
import { executeUsersGraphql } from "../graphqlClient";
import { UserApiRouteError } from "../userApi.error";

const meQuery = `
  query Me {
    me {
      id
      username
      email
      isEmailVerified
      status
      role
      name
      phone
      address
      createdAt
      updatedAt
    }
  }
`;

export async function GET(req: NextRequest) {
  try {
    const data = await executeUsersGraphql<{ me: Record<string, unknown> }>({
      query: meQuery,
      request: req,
    });

    return NextResponse.json(data.me);
  } catch (error) {
    if (error instanceof UserApiRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 },
    );
  }
}
