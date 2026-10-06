export const attachResponseHelper = async ({id, paymentIntentId, clientKey, orderId}: {id: string; paymentIntentId: string; clientKey: string; orderId: string}) => {
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
                return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/payment/status?order_id=${orderId}`,
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

  return intent;
}