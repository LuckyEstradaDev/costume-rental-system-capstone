/**
 * Central tuning values for the AR try-on. Lengths are metres unless noted.
 * Keeping them here means the rest of the feature has no magic numbers.
 */

/** Reference plane for estimating where the garment should sit in depth. */
export const ANCHOR_DEPTH = 1.5;

/** Camera-distance limits for noisy or unreasonably close poses, in metres. */
export const MIN_GARMENT_DISTANCE_M = 0.6;
export const MAX_GARMENT_DISTANCE_M = 8;

/** ID card guide width as a fraction of the camera frame width. */
export const ID_CARD_FRAME_FRACTION = 0.1;

/** Larger guide on portrait (mobile) screens so users can stand closer. */
export const ID_CARD_FRAME_FRACTION_MOBILE = 0.16;

/** ID card (CR80) landscape height : width, for drawing the guide. */
export const ID_CARD_ASPECT = 53.98 / 85.6;

/** Easing time constants (ms); smaller closes the gap faster. */
export const YAW_TAU_MS = 140;
export const ROLL_TAU_MS = 140;
export const POSITION_TAU_MS = 90;
export const ARM_TAU_MS = 80;

/** Time constant (ms) for the body-measurement EMA. */
export const MEASURE_TAU_MS = 120;

/** Minimum landmark visibility before it is trusted. */
export const SHOULDER_VIS_MIN = 0.6;
export const HIP_VIS_MIN = 0.6;
export const LIMB_VIS_MIN = 0.5;
export const PROFILE_VIS_MIN = 0.35;

/** Keep the last reliable pose through brief landmark dropouts. */
export const POSE_HOLD_MS = 400;

/** Flip to +1 if the garment turns the wrong way when the body faces sideways. */
export const YAW_SIGN = -1;

/** Diagnostic: drive the bones with a sine idle animation instead of the tracker. */
export const ENABLE_IDLE_TEST = false;

/** Show the 3D garment in the AR scene. */
export const SHOW_GARMENT = true;

/** Show tracked landmarks and garment bones over the try-on preview. */
export const SHOW_ALIGNMENT_DEBUG = false;
export const POSE_DEBUG_COLOR = "#4ade80";
export const BONE_DEBUG_COLOR = "#22d3ee";

/** Vertical nudge (world units) for the garment; positive lifts it. */
export const GARMENT_Y_OFFSET = 0;

/** Pose inference runs at most ~30 times a second. */
export const DETECT_INTERVAL_MS = 1000 / 30;
