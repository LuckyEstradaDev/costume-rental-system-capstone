/**
 * Central tuning values for the AR try-on. Lengths are metres unless noted.
 * Keeping them here means the rest of the feature has no magic numbers.
 */

/** Depth plane (world units) the garment is anchored to, in front of the camera. */
export const ANCHOR_DEPTH = 1.5;

/** The rig is authored 1:1 in metres, so one model unit is one real metre. */
export const METERS_PER_MODEL_UNIT = 1.0;

/** Garment size the model represents; other sizes scale from here. */
export const BASE_GARMENT_SIZE = "M";

/** Lateral stretch on the root spine bone. 1 leaves the rig as authored. */
export const SHOULDER_WIDEN = 1;

/** Fallback shoulder width (metres) for rigs with no measurable shoulders. */
export const FALLBACK_MODEL_SHOULDER = 0.174;

/** ID card guide width as a fraction of the camera frame width. */
export const ID_CARD_FRAME_FRACTION = 0.1;

/** ID card (CR80) landscape height : width, for drawing the guide. */
export const ID_CARD_ASPECT = 53.98 / 85.6;

/** Easing time constants (ms); smaller closes the gap faster. */
export const SCALE_TAU_MS = 180;
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

/** Chest width approximation from the shoulder-joint span (no chest landmark). */
export const CHEST_WIDTH_FROM_SHOULDER = 1.12;

/** Flip to +1 if the garment turns the wrong way when the body faces sideways. */
export const YAW_SIGN = -1;

/** Keeps the arm solver's yaw division finite when the body is edge-on. */
export const ARM_YAW_EPS = 0.08;

/** Diagnostic: drive the bones with a sine idle animation instead of the tracker. */
export const ENABLE_IDLE_TEST = false;

/** Temporarily hide the 3D garment while inspecting the pose debug overlay. */
export const SHOW_GARMENT = false;

/** Vertical nudge (world units) for the garment; positive lifts it. */
export const GARMENT_Y_OFFSET = 0;

/** How long a fit warning must hold before it shows / clears (ms). */
export const FIT_CONFIRM_MS = 600;
export const FIT_CONFIRM_OK_MS = 400;

/** Pose inference runs at most ~30 times a second. */
export const DETECT_INTERVAL_MS = 1000 / 30;
