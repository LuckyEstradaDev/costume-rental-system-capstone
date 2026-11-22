"use client";

import Link from "next/link";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";
import {ArrowRight, Receipt} from "lucide-react";
import {Button} from "@/components/ui/button";
import {staggerContainer, staggerItem} from "@/components/motion";
import {OrderTrackingCard} from "./OrderTrackingCard";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";
import type {PackageSource} from "@/lib/package-identity";

export function OrdersList({
  items,
  packages,
  onShowAll,
}: {
  items: (IOrder | IRent)[];
  packages: PackageSource[];
  onShowAll?: () => void;
}) {
  const reduceMotion = useReducedMotion();

  if (items.length === 0) {
    return (
      <motion.div
        initial={reduceMotion ? false : {opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3, ease: "easeOut"}}
      >
        <section className="flex flex-col items-center rounded-lg bg-background px-6 py-14 text-center sm:py-20">
          <Receipt aria-hidden="true" className="mb-5 size-8 text-secondary" />
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {onShowAll ? "No orders in this view" : "No orders yet"}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-secondary/75">
            {onShowAll
              ? "View your full order history to see your other orders."
              : "Rent or buy a costume to start tracking your orders here."}
          </p>
          {onShowAll ? (
            <Button type="button" size="lg" variant="outline" className="mt-6" onClick={onShowAll}>
              Show all orders
            </Button>
          ) : (
            <Button asChild size="lg" className="mt-6">
              <Link href="/dashboard/browse">
                Browse costumes
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          )}
        </section>
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
