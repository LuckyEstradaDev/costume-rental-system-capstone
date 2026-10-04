import mongoose from "mongoose";
import type {Request, Response} from "express";
import {OrderModel} from "../models/OrderModel.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";
import crypto from "crypto";
import {HTTPError} from "../utils/HttpError.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";

export async function Payment(req: ITokenRequest, res: Response) {
  try {
    const {orderId} = req.params as {orderId: string};

    if (!mongoose.isValidObjectId(orderId)) {
      throw new HTTPError("Order not found.", 404);
    }

    const order =
      (await OrderModel.findById(orderId)) ??
      (await RentModel.findById(orderId));

    if (!order) throw new HTTPError("Order not found.", 404);

    if (String(order.userID) !== String(req.user?._id)) {
      throw new HTTPError("You do not have access to this order.", 403);
    }

    const response = await fetch(
      "https://api.paymongo.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(process.env.PAYMONGO_SECRET_KEY + ":"),
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(order.totalAmount * 100),
              currency: "PHP",
              payment_method_allowed: ["card"],
              description: `Order ${order.referenceID}`,
            },
          },
        }),
      },
    );

    const intent = await response.json();

    if (!response.ok) {
      throw new HTTPError(
        intent?.errors?.[0]?.detail ?? "Paymongo API call error.",
        response.status,
      );
    }

    if (order.paymentID) {
      await PaymentModel.findByIdAndUpdate(order.paymentID, {
        $set: {paymentIntentId: intent.data.id},
      });
    }

    return res.status(201).json(intent);
  } catch (error) {
    return sendErrorResponse(res, error, "Paymongo API call error.");
  }
}

export async function webhookHandler(req: Request, res: Response) {
  try {
    const signatureHeader = req.headers["paymongo-signature"];

    const rawBody = req.body as Buffer;

    if (!process.env.WEBHOOK_SECRET) {
      throw new HTTPError("Missing webhook secret key.", 500);
    }

    if (!signatureHeader || typeof signatureHeader !== "string") {
      throw new HTTPError("Missing PayMongo signature header.", 400);
    }

    if (!verifyWebhook(rawBody, process.env.WEBHOOK_SECRET, signatureHeader)) {
      throw new HTTPError("Invalid Paymongo signature.", 400);
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    console.log("Valid PayMongo webhook:", event);

    const eventType = event.data?.attributes?.type;
    const resource = event.data?.attributes?.data;
    const intentId = resource?.attributes?.payment_intent_id;

    if (
      intentId &&
      (eventType === "payment.paid" || eventType === "payment.failed")
    ) {
      const isPaid = eventType === "payment.paid";

      const payment = await PaymentModel.findOneAndUpdate(
        {paymentIntentId: intentId, status: "pending"},
        {
          $set: isPaid
            ? {status: "paid", paidAt: new Date()}
            : {status: "failed"},
        },
      );

      if (!payment) {
        console.log("No pending payment matched intent", intentId);
      }
    } else {
      console.log("Unhandled webhook event:", eventType, intentId);
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    return sendErrorResponse(res, error, "Paymongo webhook error.");
  }
}

function verifyWebhook(
  rawBody: Buffer,
  secret: string,
  signatureHeader: string,
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((pair) => {
      const [key, ...rest] = pair.trim().split("=");
      return [key, rest.join("=")];
    }),
  );

  const timestamp = parts.t;
  if (!timestamp) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");

  return [parts.te, parts.li].some((candidate) => {
    if (!candidate) return false;
    const candidateBuffer = Buffer.from(candidate, "hex");
    return (
      candidateBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, candidateBuffer)
    );
  });
}
