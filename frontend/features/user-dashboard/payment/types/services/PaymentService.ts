import {api} from "@/lib/axios";

import {PaymentDetailsPanelValues} from "../../components/PaymentDetailsPanel";
import { attachResponseHelper } from "../../helpers/attachResponseHelper";
import {getPaymongoAuthorization} from "../../helpers/paymongoAuthorization";

export async function cardPaymentService(
  orderId: string,
  cardDetails: PaymentDetailsPanelValues,
  orderReferenceId?: string,
) {
  const {data} = await api.post(`/api/paymongo/intents/${orderId}`);
  const authorization = getPaymongoAuthorization(data.paymongoMode);

  const clientKey = data.data.attributes.client_key;
  const paymentIntentId = data.data.id;

  const response = await fetch("https://api.paymongo.com/v1/payment_methods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          type: "card",
          details: {
            card_number: cardDetails.cardNumber,
            exp_month: parseInt(cardDetails.expMonth),
            exp_year: parseInt(cardDetails.expYear),
            cvc: cardDetails.cvc,
          },
          billing: {
            name: cardDetails.billingName,
            email: cardDetails.billingEmail,
            phone: cardDetails.billingPhone,
            address: {
              line1: cardDetails.billingAddress,
              city: cardDetails.billingCity,
              state: cardDetails.billingState,
              postal_code: cardDetails.billingPostalCode,
              country: "PH",
            },
          },
        },
      },
    }),
  });

  const paymentMethod = await response.json();

  if (!response.ok) {
    throw new Error(
      paymentMethod.errors?.[0]?.detail ?? "Failed to create payment method.",
    );
  }

  const id = paymentMethod.data?.id;

  if (!id) {
    throw new Error("Payment method ID is undefined.");
  }

  const intent = await attachResponseHelper({
    authorization,
    id,
    paymentIntentId,
    clientKey,
    orderReferenceId: orderReferenceId ?? orderId,
  });

  if (intent.data.attributes.status === "awaiting_next_action") {
    const redirectUrl = intent.data.attributes.next_action.redirect.url;

    window.location.href = redirectUrl;
  }

  return intent;
}

export async function qrphPaymentService(
  orderId: string,
  orderReferenceId?: string,
) {
  const {data} = await api.post(`/api/paymongo/intents/${orderId}`);
  const authorization = getPaymongoAuthorization(data.paymongoMode);

  const clientKey = data.data.attributes.client_key;
  const paymentIntentId = data.data.id;

  const response = await fetch("https://api.paymongo.com/v1/payment_methods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          type: "qrph",
        },
      },
    }),
  });

  const paymentMethod = await response.json();

  if (!response.ok) {
    throw new Error(
      paymentMethod.errors?.[0]?.detail ??
        "Failed to create QR Ph payment method.",
    );
  }

  const id = paymentMethod.data?.id;

  if (!id) {
    throw new Error("Payment method ID is undefined.");
  }

  return attachResponseHelper({
    authorization,
    id,
    paymentIntentId,
    clientKey,
    orderReferenceId: orderReferenceId ?? orderId,
  });
}


export async function confirmTestWalletPayment(orderReference: string) {
  await api.post(`/api/paymongo/intents/${encodeURIComponent(orderReference)}/confirm-test-wallet`);
}

export async function walletPaymentService(
  orderId: string,
  method: "gcash" | "paymaya",
  paymentDetails: PaymentDetailsPanelValues,
  orderReferenceId?: string,
) {
  const {data} = await api.post(`/api/paymongo/intents/${orderId}`);
  if (data.paymongoMode !== "test") {
    throw new Error("The backend did not create a PayMongo test intent.");
  }
  const authorization = getPaymongoAuthorization(data.paymongoMode);

  const clientKey = data.data.attributes.client_key;
  const paymentIntentId = data.data.id;

 const response = await fetch(
    "https://api.paymongo.com/v1/payment_methods",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },

      body: JSON.stringify({
        data: {
          attributes: {
            type: method,

            billing: {
              name: paymentDetails.billingName,
              email: paymentDetails.billingEmail,
              phone: paymentDetails.billingPhone,
            },
          },
        },
      }),
    },
  );

  const paymentMethod = await response.json();

  if (!response.ok) {
    throw new Error(
      paymentMethod.errors?.[0]?.detail ??
        "Failed to create the wallet payment method.",
    );
  }

  const id = paymentMethod.data?.id;

  if (!id) {
    throw new Error("Payment method ID is undefined.");
  }

  const returnUrl = new URL("/dashboard/payment/status", window.location.origin);
  returnUrl.searchParams.set("order_id", orderReferenceId ?? orderId);
  returnUrl.searchParams.set("wallet_test", "1");

  const intent = await attachResponseHelper({
    authorization,
    id,
    paymentIntentId,
    clientKey,
    orderReferenceId: orderReferenceId ?? orderId,
    returnUrl: returnUrl.href,
  });

  const redirectUrl: unknown = intent.data.attributes.next_action?.redirect?.url;
  if (
    intent.data.attributes.status !== "awaiting_next_action" ||
    typeof redirectUrl !== "string" ||
    !redirectUrl.startsWith("https://")
  ) {
    throw new Error("PayMongo did not return a wallet sandbox link.");
  }

  window.location.href = redirectUrl;
  return intent;
}
