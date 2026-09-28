import type {IRent} from "@/features/user-dashboard/rent/types/IRent";

/**
 * Legacy helpers retained for the payment/outfit tallies that have no
 * windowing requirement. Date bucketing moved to `dateRange.ts` +
 * `applyFilters.ts`, which produce dense, gap-filled series instead of the
 * sparse, phantom-seeded objects these used to build.
 */

export const sortPaymentByStatus = (payments: {status: string}[]) => {
  if (!Array.isArray(payments)) {
    return {};
  }

  return payments.reduce(
    (acc: Record<string, number>, payment: {status: string}) => {
      if (payment.status === "paid") {
        acc["paid"] = (acc["paid"] || 0) + 1;
      } else if (payment.status === "pending") {
        acc["pending"] = (acc["pending"] || 0) + 1;
      } else if (payment.status === "failed") {
        acc["failed"] = (acc["failed"] || 0) + 1;
      } else if (payment.status === "refunded") {
        acc["refunded"] = (acc["refunded"] || 0) + 1;
      }
      return acc;
    },
    {},
  );
};

export const sortMostOrderedOutfits = (rents: IRent[]) => {
  return rents.reduce((acc: Record<string, number>, rent: IRent) => {
    rent.items.forEach((item) => {
      if (acc[item.name]) {
        acc[item.name] += item.quantity;
      } else {
        acc[item.name] = item.quantity;
      }
    });
    return acc;
  }, {});
};
