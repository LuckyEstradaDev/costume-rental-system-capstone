"use client";

import {motion} from "framer-motion";
import {StatCard} from "@/components/ui/stat-card";
import {Clock, ShoppingBag, Ticket} from "@/components/ui/stat-icons";
import {staggerContainer, staggerItem} from "@/components/motion";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

type OrdersStatsProps = {
  items: (IOrder | IRent)[];
  isLoading?: boolean;
};

export function OrdersStats({items, isLoading}: OrdersStatsProps) {
  const orderCount = items.filter((item) => item.type === "purchase").length;
  const rentCount = items.filter((item) => item.type === "rent").length;
  const activeCount = items.filter(
    (item) => item.status === "pending" || item.status === "active",
  ).length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4"
    >
      <motion.div variants={staggerItem}>
        <StatCard
          label="Orders"
          value={orderCount}
          icon={<ShoppingBag />}
          isLoading={isLoading}
        />
      </motion.div>
      <motion.div variants={staggerItem}>
        <StatCard
          label="Rents"
          value={rentCount}
          icon={<Ticket />}
          isLoading={isLoading}
        />
      </motion.div>
      <motion.div variants={staggerItem} className="col-span-2 md:col-span-1">
        <StatCard
          label="In progress"
          value={activeCount}
          icon={<Clock />}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
