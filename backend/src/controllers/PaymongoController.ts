import mongoose from "mongoose";
import type {Request, Response} from "express";
import {OrderModel} from "../models/OrderModel.js";
import {PaymentModel} from "../models/PaymentModel.js";
import {RentModel} from "../models/RentModel.js";
import crypto from "crypto";
import {HTTPError} from "../utils/HttpError.js";
import {sendErrorResponse} from "../utils/sendErrorResponse.js";
import {entityIdentifierFilter} from "../utils/entityIdentifier.js";
import type {ITokenRequest} from "../interfaces/ITokenReq.js";
import {markReservationPayment} from "../services/reservation.service.js";
import {
  getRemainingBalance,
  hasReservationExpired,
  isReservationPaid,
  isReservationRequested,
  isReservationTerminal,
  matchesReservationIntent,
} from "../utils/reservation.js";

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

    const payment = order.paymentID
      ? await PaymentModel.findById(order.paymentID)
      : await PaymentModel.findOne({orderID: order._id});
    const isReservation = isReservationRequested(payment);
    const reservationPaid = isReservationPaid(payment);
    const isReservationPayment = isReservation && !reservationPaid;
    const isBalancePayment = isReservation && reservationPaid;

    if (payment?.reservation?.method === "cash") {
      throw new HTTPError("Cash reservations are paid at pickup.", 409);
    }

    if (payment?.status === "paid") {
      throw new HTTPError("Payment has already been paid.", 409);
    }

    if (isReservationTerminal(payment) && !reservationPaid) {
      throw new HTTPError("Reservation payment is no longer available.", 409);
    }

    if (isReservationPayment && hasReservationExpired(payment)) {
      throw new HTTPError("Reservation payment window has expired.", 409);
    }

    if (isBalancePayment && payment?.method === "cash") {
      throw new HTTPError("Remaining balance must be paid in cash.", 409);
    }

    const amount = isReservationPayment
      ? Number(payment?.reservation?.amount ?? 0)
      : isBalancePayment
        ? getRemainingBalance(payment, Number(order.totalAmount ?? 0))
        : Number(order.totalAmount ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new HTTPError("Payment amount is unavailable.", 409);
    }

    const secretKey = process.env.PAYMONGO_TEST_SECRET_KEY;
    if (!secretKey?.startsWith("sk_test_")) {
      throw new HTTPError("PayMongo test secret key is not configured.", 500);
    }

    const response = await fetch(
      "https://api.paymongo.com/v1/payment_intents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(secretKey + ":"),
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(amount * 100),
              currency: "PHP",
              payment_method_allowed: ["gcash", "paymaya", "qrph"],
              description: isReservationPayment
                ? `Reservation ${order.referenceID}`
                : isBalancePayment
                  ? `Balance ${order.referenceID}`
                  : `Order ${order.referenceID}`,
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

    if (payment) {
      await PaymentModel.findByIdAndUpdate(
        payment._id,
        isReservationPayment
          ? {$set: {"reservation.paymentIntentId": intent.data.id}}
          : {$set: {paymentIntentId: intent.data.id}},
      );
    }

    return res.status(201).json({...intent, paymongoMode: "test"});
  } catch (error) {
    return sendErrorResponse(res, error, "Paymongo API call error.");
  }
}

export async function confirmTestWalletPayment(req: ITokenRequest, res: Response) {
  if (process.env.NODE_ENV !== "development") {
    return res.sendStatus(404);
  }

  try {
    const filter = entityIdentifierFilter(String(req.params.orderId));
    const order = (await OrderModel.findOne(filter)) ?? (await RentModel.findOne(filter));
    if (!order || String(order.userID) !== String(req.user?._id)) {
      throw new HTTPError("Order not found.", 404);
    }
    if (order.status === "cancelled") return res.sendStatus(204);

    const payment = order.paymentID
      ? await PaymentModel.findById(order.paymentID)
      : await PaymentModel.findOne({orderID: order._id});
    if (!payment || payment.status !== "pending") return res.sendStatus(204);

    const isReservationPayment = isReservationRequested(payment) && !isReservationPaid(payment);
    const method = isReservationPayment ? payment.reservation?.method : payment.method;
    const intentId = isReservationPayment
      ? payment.reservation?.paymentIntentId
      : payment.paymentIntentId;
    if ((method !== "gcash" && method !== "paymaya") || !intentId) {
      return res.sendStatus(204);
    }

    const secretKey = process.env.PAYMONGO_TEST_SECRET_KEY;
    if (!secretKey?.startsWith("sk_test_")) {
      throw new HTTPError("PayMongo test secret key is not configured.", 500);
    }
    const response = await fetch(
      `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(intentId)}`,
      {headers: {Authorization: "Basic " + btoa(secretKey + ":")}},
    );
    if (!response.ok) {
      throw new HTTPError("Unable to verify the PayMongo test payment.", 502);
    }
    const intent = await response.json();
    if (intent.data?.id !== intentId || intent.data.attributes?.status !== "succeeded") {
      return res.sendStatus(204);
    }

    if (isReservationPayment) {
      await markReservationPayment(payment._id.toString(), intentId, true);
    } else {
      await PaymentModel.updateOne(
        {_id: payment._id, paymentIntentId: intentId, status: "pending"},
        {$set: {status: "paid", paidAt: new Date()}},
      );
    }
    return res.sendStatus(204);
  } catch (error) {
    return sendErrorResponse(res, error, "Unable to confirm the test wallet payment.");
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

      const payment = await PaymentModel.findOne({
        $or: [
          {paymentIntentId: intentId},
          {"reservation.paymentIntentId": intentId},
        ],
      });

      if (!payment) {
        console.log("No pending payment matched intent", intentId);
      } else if (matchesReservationIntent(payment, intentId)) {
        await markReservationPayment(payment._id.toString(), intentId, isPaid);
      } else {
        await PaymentModel.findOneAndUpdate(
          {paymentIntentId: intentId, status: "pending"},
          {
            $set: isPaid
              ? {status: "paid", paidAt: new Date()}
              : {status: "failed"},
          },
        );
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
