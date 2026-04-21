import { NextRequest, NextResponse } from "next/server";
import { executeUsersGraphql } from "../users/graphqlClient";
import { UserApiRouteError } from "../users/userApi.error";

const myOrdersQuery = `
  query MyOrders {
    myOrders {
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

export async function GET(req: NextRequest) {
  try {
    const data = await executeUsersGraphql<{
      myOrders: Record<string, unknown>[];
    }>({
      query: myOrdersQuery,
      request: req,
    });

    return NextResponse.json(Array.isArray(data.myOrders) ? data.myOrders : []);
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
