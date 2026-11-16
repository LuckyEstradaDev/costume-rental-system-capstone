"use client";

import {AnimatePresence, motion} from "framer-motion";
import {Receipt} from "lucide-react";
import {Card} from "@/components/ui/card";
import {staggerContainer, staggerItem} from "@/components/motion";
import {OrderTrackingCard} from "./OrderTrackingCard";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";
import type {PackageSource} from "@/lib/package-identity";

export function OrdersList({
  items,
  packages,
}: {
  items: (IOrder | IRent)[];
  packages: PackageSource[];
}) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{opacity: 0, y: 16}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3, ease: "easeOut"}}
      >
        <Card className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
          <Receipt className="mb-4 size-9 text-muted-foreground" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            No records found
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your orders and rents will appear here.
          </p>
        </Card>
      </motion.div>
    );
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
