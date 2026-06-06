import {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {IOutfit} from "../../inventory-tab/types/IOutfit";

export const sortRevenue = (
  payments: {createdAt: string; totalAmount: string; status: string}[],
  dateLabel: string,
) => {
  //sort the dates from oldest to newest
  const sortedPayments = payments
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .filter((payment) => payment.status === "paid");

  let revenue: Record<string, number> = {};

  if ("Day" === dateLabel) {
    revenue = sortedPayments.reduce(
      (
        acc: Record<string, number>,
        order: {createdAt: string; totalAmount: string},
      ) => {
        //initialize default dates so that when only one day is present, the chart will still show the timeline
        for (let i = 1; i <= 5; i++) {
          const date = new Date(order.createdAt);
          date.setDate(date.getDate() + i);
          acc[date.toLocaleDateString()] = acc[date.toLocaleDateString()] || 0;
        }
        const day = new Date(order.createdAt).toLocaleDateString();
        const key = `${day}`;
        if (!acc[key]) {
          acc[key] = Number(order.totalAmount);
        } else {
          acc[key] += Number(order.totalAmount);
        }
        return acc;
      },
      {},
    );
  } else if ("Month" === dateLabel) {
    revenue = sortedPayments.reduce(
      (
        acc: Record<string, number>,
        order: {createdAt: string; totalAmount: string},
      ) => {
        //get the month from the createdAt date and use it as the key for the accumulator
        const month = new Date(order.createdAt).toLocaleString("default", {
          month: "long",
        });
        const key = `${month}`;
        //if the month is not in the accumulator, add it with the total amount, otherwise add the total amount to the existing value
        if (!acc[key]) {
          acc[key] = Number(order.totalAmount);
        } else {
          acc[key] += Number(order.totalAmount);
        }
        return acc;
      },
      {},
    );
  } else if ("Year" === dateLabel) {
    revenue = sortedPayments.reduce(
      (
        acc: Record<string, number>,
        order: {createdAt: string; totalAmount: string},
      ) => {
        //initialize default dates so that when only one year is present, the chart will still show the timeline
        acc["2023"] = acc["2023"] || 0;
        acc["2024"] = acc["2024"] || 0;
        acc["2025"] = acc["2025"] || 0;
        acc["2026"] = acc["2026"] || 0;
        const year = new Date(order.createdAt).toLocaleString("default", {
          year: "numeric",
        });
        const key = `${year}`;

        if (!acc[key]) {
          acc[key] = Number(order.totalAmount);
        } else {
          acc[key] += Number(order.totalAmount);
        }
        return acc;
      },
      {},
    );
  }

  return revenue;
};

export const sortOrdersRents = (
  data: {createdAt: string}[],
  dateLabel: string,
) => {
  //sort the dates from oldest to newest
  const sortedData = data.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  let ordersRents: Record<string, number> = {};

  if ("Day" === dateLabel) {
    ordersRents = sortedData.reduce(
      (acc: Record<string, number>, item: {createdAt: string}) => {
        //initialize default dates so that when only one day is present, the chart will still show the timeline
        for (let i = 1; i <= 5; i++) {
          const date = new Date(item.createdAt);
          date.setDate(date.getDate() + i);
          acc[date.toLocaleDateString()] = acc[date.toLocaleDateString()] || 0;
        }
        const day = new Date(item.createdAt).toLocaleDateString();
        const key = `${day}`;
        if (!acc[key]) {
          acc[key] = 1;
        } else {
          acc[key] += 1;
        }
        return acc;
      },
      {},
    );
  } else if ("Month" === dateLabel) {
    ordersRents = sortedData.reduce(
      (acc: Record<string, number>, item: {createdAt: string}) => {
        //get the month from the createdAt date and use it as the key for the accumulator
        const month = new Date(item.createdAt).toLocaleString("default", {
          month: "long",
        });
        const key = `${month}`;
        //if the month is not in the accumulator, add it with a count of 1, otherwise increment the existing value
        if (!acc[key]) {
          acc[key] = 1;
        } else {
          acc[key] += 1;
        }
        return acc;
      },
      {},
    );
  } else if ("Year" === dateLabel) {
    ordersRents = sortedData.reduce(
      (acc: Record<string, number>, item: {createdAt: string}) => {
        //initialize default dates so that when only one year is present, the chart will still show the timeline
        acc["2023"] = acc["2023"] || 0;
        acc["2024"] = acc["2024"] || 0;
        acc["2025"] = acc["2025"] || 0;
        acc["2026"] = acc["2026"] || 0;
        const year = new Date(item.createdAt).toLocaleString("default", {
          year: "numeric",
        });
        const key = `${year}`;

        if (!acc[key]) {
          acc[key] = 1;
        } else {
          acc[key] += 1;
        }
        return acc;
      },
      {},
    );
  }

  return ordersRents;
};

export const sortPaymentByStatus = (payments: {status: string}[]) => {
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
