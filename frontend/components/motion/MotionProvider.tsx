"use client";

import {MotionConfig} from "framer-motion";
import type {ReactNode} from "react";

/**
 * Applies the OS "reduce motion" preference to every motion component below
 * it. Transforms are dropped and only opacity is animated, so the dashboard
 * still feels alive without moving for users who asked for less.
 */
export function MotionProvider({children}: {children: ReactNode}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
