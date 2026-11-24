"use client";

import {EmptyState} from "@/components/ui/empty-state";
import {AnimatePresence, motion} from "framer-motion";
import {Receipt} from "lucide-react";
import {staggerContainer, staggerItem} from "@/components/motion";
import {OrderTrackingCard} from "./OrderTrackingCard";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";
import type {PackageSource} from "@/lib/package-identity";

export function OrdersList({
  items,
  packages,
  isFiltered,
}: {
  items: (IOrder | IRent)[];
  packages: PackageSource[];
  isFiltered?: boolean;
}) {
  if (items.length === 0) {
    return <EmptyState icon={Receipt} title={isFiltered ? "No orders in this view" : "No orders yet"} />;
  }

  return (
    <motion.div
      layout
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            layout
            key={item._id}
            variants={staggerItem}
            exit="exit"
            whileHover={{y: -2}}
          >
            <OrderTrackingCard item={item} packages={packages} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
