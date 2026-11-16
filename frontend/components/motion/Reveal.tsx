"use client";

import {motion, useReducedMotion} from "framer-motion";
import type {ReactNode} from "react";

import {spring} from "./variants";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before this block animates in. */
  delay?: number;
  /** Vertical travel in pixels; set to 0 for a pure fade. */
  y?: number;
};

/**
 * Fades and lifts a block into view the first time it is scrolled to. The
 * travel distance collapses to a plain fade when the OS asks for reduced
 * motion.
 */
export function Reveal({children, className, delay = 0, y = 24}: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{opacity: 0, y: reduce ? 0 : y}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.2}}
      transition={{...spring, delay}}
    >
      {children}
    </motion.div>
  );
}
