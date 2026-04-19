import { NextRequest, NextResponse } from "next/server";
import { executeUsersGraphql } from "../graphqlClient";
import { UserApiRouteError } from "../userApi.error";

const forgotUsernameMutation = `
  mutation ForgotUsername($input: EmailInput!) {
    forgotUsername(input: $input) {
      message
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await executeUsersGraphql<
      { forgotUsername: { message: string } },
      { input: { email: string } }
    >({
      query: forgotUsernameMutation,
      variables: { input: body },
    });

    return NextResponse.json(data.forgotUsername);
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
