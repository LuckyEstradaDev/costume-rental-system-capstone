"use client";

import {AnimatePresence, motion, useReducedMotion} from "framer-motion";

export function BrowsePriceAmount({price}: {price: number}) {
  const reduceMotion = useReducedMotion();
  const amount = `₱${price.toLocaleString()}`;

  return (
    <span className="inline-flex text-[22px] leading-tight font-semibold text-primary tabular-nums">
      <span className="sr-only">{amount}</span>
      <span aria-hidden className="inline-flex">
        {reduceMotion ? amount : [...amount].map((character, index) => (
          <span key={index} className="inline-grid overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.span
                key={character}
                className="col-start-1 row-start-1"
                initial={{y: "100%"}}
                animate={{y: 0}}
                exit={{y: "-100%"}}
                transition={{duration: 0.26, ease: "easeInOut"}}
              >
                {character}
              </motion.span>
            </AnimatePresence>
          </span>
        ))}
      </span>
    </span>
  );
}
