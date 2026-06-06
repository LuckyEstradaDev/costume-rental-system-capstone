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
        //initialize default dates so that when only one year is present, the chart will still show the timeline
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
