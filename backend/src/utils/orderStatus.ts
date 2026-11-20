import {HTTPError} from "./HttpError.js";

type StatusRecord = {
  type?: string;
  status?: string;
  payment?: {status?: string | null; method?: string | null} | null;
  securityDeposit?: unknown;
};

const PURCHASE_TRANSITIONS: Record<string, string[]> = {
  pending: ["ready", "cancelled"],
  ready: ["received", "cancelled"],
};

const RENT_TRANSITIONS: Record<string, string[]> = {
  pending: ["ready", "cancelled"],
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

  if (target === "ready" && !isRent && !isCash && !isPaid) {
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
