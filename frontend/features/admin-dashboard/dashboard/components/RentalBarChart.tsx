"use client";

import {useMemo} from "react";
import {Bar} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import type {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import type {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {
  AXIS_TICK_COLOR,
  CHART_COLORS,
  GRID_COLOR,
  withAlpha,
} from "../utils/chartPalette";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const TOP_N = 8;

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y" as const,
  plugins: {
    legend: {display: false},
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {color: GRID_COLOR},
      ticks: {color: AXIS_TICK_COLOR, precision: 0, stepSize: 1},
    },
    y: {
      grid: {display: false},
      ticks: {color: AXIS_TICK_COLOR},
    },
  },
};

/** Sum item quantities by outfit name across a set of transactions. */
const tallyOutfits = (
  transactions: Array<{items: {name: string; quantity: number}[]}>,
): Record<string, number> =>
  transactions.reduce<Record<string, number>>((acc, transaction) => {
    for (const item of transaction.items ?? []) {
      acc[item.name] = (acc[item.name] ?? 0) + item.quantity;
    }
    return acc;
  }, {});

/**
 * Cap the bar count and roll the tail into "Other" — the previous version
 * rendered one bar per distinct outfit, which becomes unreadable fast.
 */
const toChartData = (
  counts: Record<string, number>,
  label: string,
  backgroundColor: string,
): ChartData<"bar"> => {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (entries.length <= TOP_N) {
    return {
      labels: entries.map(([name]) => name),
      datasets: [
        {
          label,
          data: entries.map(([, value]) => value),
          backgroundColor,
          borderRadius: 6,
        },
      ],
    };
  }

  const head = entries.slice(0, TOP_N);
  const tailTotal = entries
    .slice(TOP_N)
    .reduce((total, [, value]) => total + value, 0);

  return {
    labels: [...head.map(([name]) => name), "Other"],
    datasets: [
      {
        label,
        data: [...head.map(([, value]) => value), tailTotal],
        backgroundColor,
        borderRadius: 6,
      },
    ],
  };
};

interface OutfitBarChartProps {
  transactions: Array<IOrder | IRent>;
  label: string;
  color: string;
  emptyLabel: string;
}

function OutfitBarChart({
  transactions,
  label,
  color,
  emptyLabel,
}: OutfitBarChartProps) {
  const {data, isEmpty} = useMemo(() => {
    const chart = toChartData(tallyOutfits(transactions), label, color);
    return {data: chart, isEmpty: (chart.labels ?? []).length === 0};
  }, [transactions, label, color]);

  if (isEmpty) {
    return (
      <div className="grid h-full place-items-center px-4 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return <Bar options={barChartOptions} data={data} />;
}

export function MostRentedOutfitChart({
  rents,
}: {
  rents: IRent[];
}) {
  const completed = useMemo(
    () => rents.filter((rent) => rent.status === "returned"),
    [rents],
  );

  return (
    <OutfitBarChart
      transactions={completed}
      label="Most rented"
      color={withAlpha(CHART_COLORS.mostRented, 0.9)}
      emptyLabel="No completed rentals in this selection."
    />
  );
}

export function MostBoughtOutfitChart({orders}: {orders: IOrder[]}) {
  return (
    <OutfitBarChart
      transactions={orders}
      label="Most bought"
      color={withAlpha(CHART_COLORS.mostBought, 0.9)}
      emptyLabel="No purchases in this selection."
    />
  );
}
