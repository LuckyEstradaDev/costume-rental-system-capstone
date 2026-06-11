import {IRent} from "@/features/user-dashboard/rent/types/IRent";

export const sortRevenue = (
  payments: {createdAt: string; totalAmount: string; status: string}[],
  dateLabel: string,
) => {
  //sort the dates from oldest to newest
  const sortedPayments = [...payments]
    .filter((payment) => payment.status === "paid")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  let revenue: Record<string, number> = {};

  if ("Day" === dateLabel) {
    revenue = sortedPayments.reduce(
      (
        acc: Record<string, number>,
        order: {createdAt: string; totalAmount: string},
      ) => {
        //initialize default dates so that when only one day is present, the chart will still show the timeline
        for (let i = 1; i <= 1; i++) {
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

  const sortedRevenue = Object.fromEntries(
    Object.entries(revenue).sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime(),
    ),
  );

  return sortedRevenue;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortMostOrderedOutfits = (rents: any) => {
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

export const sortUsersByDate = (
  users: {date: string; count: number}[],
  dateLabel: string,
) => {
  //since users are already sorted by date no need to sort
  let sortedUsers: Record<string, number> = {};

  if (dateLabel === "Day") {
    sortedUsers = users.reduce(
      (acc: Record<string, number>, user: {date: string; count: number}) => {
        for (let i = 1; i <= 5; i++) {
          const date = new Date(user.date);
          date.setDate(date.getDate() + i);
          acc[date.toLocaleDateString()] = acc[date.toLocaleDateString()] || 0;
        }
        const day = new Date(user.date).toLocaleDateString();

        if (!acc[day]) {
          acc[day] = Number(user.count);
        } else {
          acc[day] += Number(user.count);
        }

        return acc;
      },
      {},
    );
  } else if (dateLabel === "Month") {
    sortedUsers = users.reduce(
      (acc: Record<string, number>, user: {date: string; count: number}) => {
        const month = new Date(user.date).toLocaleString("default", {
          month: "long",
        });

        if (!acc[month]) {
          acc[month] = Number(user.count);
        } else {
          acc[month] += Number(user.count);
        }

        return acc;
      },
      {},
    );
  } else if (dateLabel === "Year") {
    sortedUsers = users.reduce(
      (acc: Record<string, number>, user: {date: string; count: number}) => {
        acc["2023"] = acc["2023"] || 0;
        acc["2024"] = acc["2024"] || 0;
        acc["2025"] = acc["2025"] || 0;
        acc["2026"] = acc["2026"] || 0;
        const year = new Date(user.date).toLocaleString("default", {
          year: "numeric",
        });

        if (!acc[year]) {
          acc[year] = Number(user.count);
        } else {
          acc[year] += Number(user.count);
        }

        return acc;
      },
      {},
    );
  }
  return sortedUsers;
};
