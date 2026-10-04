import {api} from "@/lib/axios";

import {PaymentDetailsPanelValues} from "../../components/PaymentDetailsPanel";

export async function cardPaymentService(
  cardDetails: PaymentDetailsPanelValues,
) {
  const {data} = await api.get("/api/paymongo/");

  const clientKey = data.data.attributes.client_key;
  const paymentIntentId = data.data.id;

  console.log(cardDetails);

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

  const attachResponse = await fetch(
    `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + btoa(process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY + ":"),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: id,
            client_key: clientKey,
            return_url: "https://yoursite.com/payment/complete",
          },
        },
      }),
    },
  );

  const intent = await attachResponse.json();

  if (!attachResponse.ok) {
    throw new Error(
      intent.errors?.[0]?.detail ?? "Failed to attach payment method.",
    );
  }

  if (intent.data.attributes.status === "awaiting_next_action") {
    const redirectUrl = intent.data.attributes.next_action.redirect.url;

    window.location.href = redirectUrl;
  }

  return intent;
}
