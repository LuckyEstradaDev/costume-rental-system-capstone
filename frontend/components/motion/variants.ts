import type {Transition, Variants} from "framer-motion";

/**
 * Shared motion language for the dashboard. A single spring keeps every
 * entrance feeling like it belongs to the same system, and the stagger
 * helpers let grids and lists cascade instead of popping in at once.
 */
export const spring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.8,
};

export const fadeIn: Variants = {
  hidden: {opacity: 0},
  visible: {opacity: 1, transition: {duration: 0.35, ease: "easeOut"}},
};

export const fadeInUp: Variants = {
  hidden: {opacity: 0, y: 24},
  visible: {opacity: 1, y: 0, transition: spring},
};

export const scaleIn: Variants = {
  hidden: {opacity: 0, scale: 0.94},
  visible: {opacity: 1, scale: 1, transition: spring},
};

export const slideUp: Variants = {
  hidden: {opacity: 0, y: 40},
  visible: {opacity: 1, y: 0, transition: spring},
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {staggerChildren: 0.06, delayChildren: 0.05},
  },
};

export const staggerItem: Variants = {
  hidden: {opacity: 0, y: 20, scale: 0.98},
  visible: {opacity: 1, y: 0, scale: 1, transition: spring},
  exit: {opacity: 0, y: -8, scale: 0.98, transition: {duration: 0.18}},
};
