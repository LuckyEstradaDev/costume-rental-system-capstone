/** Wraps an angle to (-pi, pi] so pose deltas take the short way round. */
export const shortestAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * Fraction of the remaining gap an exponential ease closes in `dtMs` with time
 * constant `tauMs`. Frame-rate independent smoothing.
 */
export const smoothAlpha = (dtMs: number, tauMs: number) => 1 - Math.exp(-dtMs / tauMs);
