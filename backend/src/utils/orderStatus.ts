import {HTTPError} from "./HttpError.js";

type StatusRecord = {
  type?: string;
  status?: string;
  payment?: {
    status?: string | null;
    method?: string | null;
    reservation?: {requested?: boolean; method?: string | null; status?: string | null} | null;
  } | null;
  securityDeposit?: unknown;
};

const PURCHASE_TRANSITIONS: Record<string, string[]> = {
  pending: ["reserved", "ready", "cancelled"],
  reserved: ["ready", "cancelled"],
  ready: ["received", "cancelled"],
};

const RENT_TRANSITIONS: Record<string, string[]> = {
  pending: ["reserved", "ready", "cancelled"],
  reserved: ["ready", "cancelled"],
  ready: ["active", "cancelled"],
  active: ["returned", "cancelled"],
  overdue: ["returned", "cancelled"],
};

export const assertValidStatusTransition = (
  record: StatusRecord,
  target: string,
) => {
  const current = record.status;
  const isRent = record.type === "rent";
  const transitions = isRent ? RENT_TRANSITIONS : PURCHASE_TRANSITIONS;

  if (!current || !transitions[current]?.includes(target)) {
    throw new HTTPError(
      `Invalid status transition from ${current ?? "unknown"} to ${target}.`,
      409,
    );
  }

  const isPaid = record.payment?.status === "paid";
  const isCash = record.payment?.method === "cash";
  const reservation = record.payment?.reservation;
  const isReservationPaid =
    reservation?.requested === true && reservation.status === "paid";
  const isCashReservationApproved =
    reservation?.requested === true &&
    reservation.method === "cash" &&
    reservation.status === "approved";

  if (
    target === "reserved" &&
    !(current === "pending" && reservation?.requested && reservation.method === "cash" && reservation.status === "pending")
  ) {
    throw new HTTPError("Only pending cash reservations can be approved.", 409);
  }

  if (
    target === "ready" &&
    reservation?.requested &&
    !isReservationPaid &&
    !isCashReservationApproved
  ) {
    throw new HTTPError(
      "Reservation payment must be paid before an order is ready.",
      409,
    );
  }

  if (target === "ready" && !isRent && !isCash && !isPaid && !isReservationPaid) {
    throw new HTTPError(
      "Online payments must be paid before an order is ready for pickup.",
      409,
    );
  }

  if ((target === "received" || target === "active") && !isPaid) {
    throw new HTTPError(
      isRent
        ? "Payment must be paid before the outfit can be held by the customer."
        : "Payment must be paid before the order can be received.",
      409,
    );
  }

  if (target === "active" && !record.securityDeposit) {
    throw new HTTPError(
      "A security deposit must be recorded before the outfit can be held by the customer.",
      409,
    );
  }
};
