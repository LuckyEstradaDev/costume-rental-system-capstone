"use client";

import {motion, useReducedMotion} from "framer-motion";
import type {ReactNode} from "react";

import {spring} from "./variants";

/**
 * Enter animation for a route segment. Rendered from a `template.tsx`, so it
 * remounts on every navigation and replays as the page content swaps in.
 */
export function PageTransition({children}: {children: ReactNode}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{opacity: 0, y: reduce ? 0 : 16}}
      animate={{opacity: 1, y: 0}}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}
