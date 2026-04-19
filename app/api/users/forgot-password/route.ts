import { NextRequest, NextResponse } from "next/server";
import { executeUsersGraphql } from "../graphqlClient";
import { UserApiRouteError } from "../userApi.error";

const forgotPasswordMutation = `
  mutation ForgotPassword($input: EmailInput!) {
    forgotPassword(input: $input) {
      message
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await executeUsersGraphql<
      { forgotPassword: { message: string } },
      { input: { email: string } }
    >({
      query: forgotPasswordMutation,
      variables: { input: body },
    });

    return NextResponse.json(data.forgotPassword);
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
