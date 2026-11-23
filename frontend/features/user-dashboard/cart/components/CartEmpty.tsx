"use client";

import Link from "next/link";
import {motion} from "framer-motion";
import {ArrowRight, ShoppingBag} from "lucide-react";
import {Button} from "@/components/ui/button";

export function CartEmpty() {
  return (
    <motion.div
      initial={{opacity: 0, scale: 0.96}}
      animate={{opacity: 1, scale: 1}}
      transition={{type: "spring", stiffness: 260, damping: 24}}
    >
      <div className="flex h-full flex-col items-center justify-center gap-0 py-14 text-center sm:py-20">
        <ShoppingBag
          aria-hidden="true"
          className="mb-5 size-8 text-secondary"
        />
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          Your cart is empty
        </h2>
        <p className="mt-2 text-base text-secondary/75">
          Browse costumes to rent or buy.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/dashboard/browse">
            Browse costumes
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
