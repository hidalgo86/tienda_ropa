import { NextRequest, NextResponse } from "next/server";
import { executeUsersGraphql } from "../../users/graphqlClient";
import { UserApiRouteError } from "../../users/userApi.error";

const checkoutMutation = `
  mutation CheckoutMyCart {
    checkoutMyCart {
      id
      userId
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
    const data = await executeUsersGraphql<{
      checkoutMyCart: Record<string, unknown>;
    }>({
      query: checkoutMutation,
      request: req,
    });

    return NextResponse.json(data.checkoutMyCart);
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
