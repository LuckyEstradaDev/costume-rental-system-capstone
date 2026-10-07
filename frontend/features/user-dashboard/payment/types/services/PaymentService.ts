import {api} from "@/lib/axios";

import {PaymentDetailsPanelValues} from "../../components/PaymentDetailsPanel";
import axios from "axios";
import { attachResponseHelper } from "../../helpers/attachResponseHelper";

export async function cardPaymentService(
  orderId: string,
  cardDetails: PaymentDetailsPanelValues,
) {
  const {data} = await api.post(`/api/paymongo/intents/${orderId}`);

  const clientKey = data.data.attributes.client_key;
  const paymentIntentId = data.data.id;

  const response = await fetch("https://api.paymongo.com/v1/payment_methods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + btoa(process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY + ":"),
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
    id,
    paymentIntentId,
    clientKey,
    orderId,
  });

  if (intent.data.attributes.status === "awaiting_next_action") {
    const redirectUrl = intent.data.attributes.next_action.redirect.url;

    window.location.href = redirectUrl;
  }

  return intent;
}

export async function qrphPaymentService(orderId: string) {
  const {data} = await api.post(`/api/paymongo/intents/${orderId}`);

  const clientKey = data.data.attributes.client_key;
  const paymentIntentId = data.data.id;

  const response = await fetch("https://api.paymongo.com/v1/payment_methods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + btoa(process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY + ":"),
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
    id,
    paymentIntentId,
    clientKey,
    orderId,
  });
}


export async function gcashPaymentService(orderId: string, paymentDetails: PaymentDetailsPanelValues) {
  const {data} = await api.post(`/api/paymongo/intents/${orderId}`);

  const clientKey = data.data.attributes.client_key;
  const paymentIntentId = data.data.id;

 const response = await fetch(
    "https://api.paymongo.com/v1/payment_methods",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          btoa(
            process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY + ":",
          ),
      },

      body: JSON.stringify({
        data: {
          attributes: {
            type: "gcash",

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
        "Failed to create GCash payment method.",
    );
  }

  const id = paymentMethod.data?.id;

  if (!id) {
    throw new Error("Payment method ID is undefined.");
  }

  const intent = await attachResponseHelper({
    id,
    paymentIntentId,
    clientKey,
    orderId,
  });

  if (intent.data.attributes.status === "awaiting_next_action") {
    const redirectUrl = intent.data.attributes.next_action.redirect.url;

    window.location.href = redirectUrl;
  }

  return intent;
}