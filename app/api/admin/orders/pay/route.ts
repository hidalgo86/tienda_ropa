import { NextRequest, NextResponse } from "next/server";
import { executeUsersGraphql } from "../../../users/graphqlClient";
import { UserApiRouteError } from "../../../users/userApi.error";

const adminPayOrderMutation = `
  mutation AdminPayOrder($orderId: String!) {
    adminPayOrder(orderId: $orderId) {
      id
      userId
      user {
        id
        username
        email
        status
        role
        name
        phone
        address
        isEmailVerified
        createdAt
        updatedAt
      }
      items {
        productId
        variantName
        quantity
        productName
        thumbnail
        unitPrice
        lineTotal
      }
      totalAmount
      shippingAddress {
        address
        name
        phone
      }
      status
      paymentMethod
      paymentReference
      paidAt
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { orderId?: string };
    const data = await executeUsersGraphql<
      { adminPayOrder: Record<string, unknown> },
      { orderId: string }
    >({
      query: adminPayOrderMutation,
      variables: { orderId: String(body.orderId ?? "") },
      request: req,
    });

    return NextResponse.json(data.adminPayOrder);
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
