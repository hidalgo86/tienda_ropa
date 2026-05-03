import { NextRequest, NextResponse } from "next/server";
import { executeUsersGraphql } from "../../users/graphqlClient";
import { UserApiRouteError } from "../../users/userApi.error";
import { PAYMENTS_ENABLED, paymentsDisabledMessage } from "@/lib/commerceConfig";

const checkoutMutation = `
  mutation CheckoutMyCart($input: CheckoutInput) {
    checkoutMyCart(input: $input) {
      id
      orderNumber
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
      deliveryMethod
      status
      paymentMethod
      paymentReference
      paymentReceiptNumber
      paymentProofUrl
      paymentProofPublicId
      paymentProofSubmittedAt
      paidAt
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;

export async function POST(req: NextRequest) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json(
      { error: paymentsDisabledMessage },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json().catch(() => null)) as {
      deliveryMethod?: string;
    } | null;
    const deliveryMethod =
      body?.deliveryMethod === "delivery" ? "DELIVERY" : "PICKUP";
    const data = await executeUsersGraphql<
      {
        checkoutMyCart: Record<string, unknown>;
      },
      { input: { deliveryMethod: string } }
    >({
      query: checkoutMutation,
      variables: { input: { deliveryMethod } },
      request: req,
    });

    return NextResponse.json(data.checkoutMyCart);
  } catch (error) {
    if (error instanceof UserApiRouteError) {
      return NextResponse.json({ error: "No se pudo completar la solicitud" }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 },
    );
  }
}
