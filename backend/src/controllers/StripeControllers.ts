import type {Request, Response} from "express";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";
import Stripe from "stripe";
import {PaymentModel} from "../models/PaymentModel.js";

const stripe = new Stripe(
  "sk_test_51TgmnW7a1LHYXYNFufALJHTBG1xVQTsJDYi489RtWoVtvcVDr5VNzL3j11EyvYvKnQDJd2llyMUyJPCGl2bkjHvi006VZ08JNz",
);

export const createCheckoutSessionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {paymentID, userID, orderID} = req.body;
    const session = await stripe.checkout.sessions.create({
      ui_mode: "elements",
      metadata: {
        paymentID: paymentID,
        userID: userID,
        orderID: orderID,
      },
      line_items: [
        {
          price_data: {
            currency: "php",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: 1000 * 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${process.env.CLIENT_URL}/dashboard/payment/return?session_id={CHECKOUT_SESSION_ID}&order_id=${orderID}`,
    });

    return res.status(200).json(session);
  } catch (error) {
    return sendErrorResponse(res, error, "Failed to get stripe session.");
  }
};

export const stripeWebhookController = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing signature");
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const paymentID = session.metadata?.paymentID;

      if (paymentID) {
        // Update your database
        await PaymentModel.findByIdAndUpdate(paymentID, {
          status: "paid",
          paidAt: new Date(),
        });
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send("Webhook Error");
  }
};
