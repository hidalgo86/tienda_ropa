import { NextRequest, NextResponse } from "next/server";
import { executeUsersGraphql } from "../graphqlClient";
import { UserApiRouteError } from "../userApi.error";

type CreateUserPayload = {
  email: string;
  password: string;
  username: string;
};

type RegisterMutationResponse = {
  register: {
    message: string;
  };
};

const registerMutation = `
  mutation Register($input: RegisterUserInput!) {
    register(input: $input) {
      message
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      username?: string;
    };

    if (!body.email || !body.password || !body.username) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const input: CreateUserPayload = {
      email: body.email,
      password: body.password,
      username: body.username,
    };

    const data = await executeUsersGraphql<
      RegisterMutationResponse,
      { input: CreateUserPayload }
    >({
      query: registerMutation,
      variables: { input },
    });

    return NextResponse.json(data.register, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof UserApiRouteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 },
    );
  }
}
