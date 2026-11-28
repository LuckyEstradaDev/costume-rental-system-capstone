import type {Landmark, NormalizedLandmark} from "@mediapipe/tasks-vision";
import {median, stableMedian} from "./calibration";

export type WaistView = "front" | "side";
export type WaistCapture = {
  view: WaistView;
  samples: number[];
  onComplete: (diameterM: number) => void;
  onUnavailable: () => void;
};

type Mask = {width: number; height: number; getAsFloat32Array(): Float32Array};
const WAIST_LEVEL = 0.65; // Fraction of the way down from shoulder to hip in both views.

function visible(point: NormalizedLandmark | undefined): point is NormalizedLandmark {
  return !!point && point.visibility >= 0.6 && point.x > 0 && point.x < 1 && point.y > 0 && point.y < 1;
}

function facingView(left: Landmark, right: Landmark, view: WaistView): boolean {
  const dx = left.x - right.x;
  const span = Math.hypot(dx, left.z - right.z);
  if (span < 0.05) return false;
  const frontal = Math.abs(dx) / span;
  return view === "front" ? frontal > 0.94 : frontal < 0.3;
}

const TORSO_SIDES = [
  {shoulder: 11, elbow: 13, wrist: 15, hip: 23},
  {shoulder: 12, elbow: 14, wrist: 16, hip: 24},
] as const;

function visibleTorsoSides(pose: NormalizedLandmark[], view: WaistView) {
  const sides = TORSO_SIDES.filter(({shoulder, hip}) => visible(pose[shoulder]) && visible(pose[hip]));
  if (view === "front") return sides.length === 2 ? sides : [];
  const visibility = ({shoulder, hip}: typeof sides[number]) => pose[shoulder].visibility + pose[hip].visibility;
  return sides.sort((a, b) => visibility(b) - visibility(a)).slice(0, 1);
}

/** Follow only the foreground run containing the waist. Detached arms are separate runs. */
function silhouetteSpan(pixels: Float32Array, width: number, row: number, center: number) {
  const start = row * width;
  if (pixels[start + center] < 0.75) return null;
  let left = center;
  let right = center;
  while (left > 0 && pixels[start + left - 1] >= 0.5) left--;
  while (right < width - 1 && pixels[start + right + 1] >= 0.5) right++;
  if (left === 0 || right === width - 1 || right - left < 8) return null;
  return {left, right};
}

function armOverlapsWaist(pose: NormalizedLandmark[], y: number, left: number, right: number) {
  for (const [from, to] of [[11, 13], [13, 15], [12, 14], [14, 16]]) {
    const a = pose[from];
    const b = pose[to];
    if (!visible(a) || !visible(b) || y < Math.min(a.y, b.y) || y > Math.max(a.y, b.y)) continue;
    const t = a.y === b.y ? 0.5 : (y - a.y) / (b.y - a.y);
    const x = a.x + t * (b.x - a.x);
    if (x >= left && x <= right) return true;
  }
  return false;
}

/** Measure one silhouette diameter in metres using the visible torso as the in-frame scale. */
export function waistDiameter(
  view: WaistView, pose: NormalizedLandmark[], world: Landmark[], mask: Mask,
  videoWidth: number, videoHeight: number, calibration: number,
): number | null {
  if (world.length < 25 || pose.length < 25 || !mask.width || !mask.height || !videoHeight) return null;
  if (!facingView(world[11], world[12], view) || !facingView(world[23], world[24], view)) return null;

  const sides = visibleTorsoSides(pose, view);
  if (sides.length === 0) return null;
  let centerX = 0;
  let centerY = 0;
  let torsoFraction = 0;
  let verticalMetres = 0;
  for (const {shoulder, hip, elbow, wrist} of sides) {
    if (!visible(pose[elbow]) || !visible(pose[wrist])) return null;
    const dx = pose[hip].x - pose[shoulder].x;
    const dy = pose[hip].y - pose[shoulder].y;
    if (dy < 0.12 || Math.abs(dx * videoWidth) > dy * videoHeight * 0.4) return null;
    centerX += pose[shoulder].x + dx * WAIST_LEVEL;
    centerY += pose[shoulder].y + dy * WAIST_LEVEL;
    torsoFraction += dy;
    verticalMetres += Math.abs(world[hip].y - world[shoulder].y);
  }
  centerX /= sides.length;
  centerY /= sides.length;
  const center = Math.min(mask.width - 1, Math.floor(centerX * mask.width));
  const row = Math.floor(centerY * mask.height);
  if (row < 1 || row >= mask.height - 1) return null;

  const pixels = mask.getAsFloat32Array();
  const widths: number[] = [];
  for (const offset of [-1, 0, 1]) {
    const span = silhouetteSpan(pixels, mask.width, row + offset, center);
    if (!span || armOverlapsWaist(pose, centerY, span.left / mask.width, (span.right + 1) / mask.width)) return null;
    widths.push(span.right - span.left + 1);
  }
  const width = median(widths);
  if (!width || Math.max(...widths) - Math.min(...widths) > width * 0.1) return null;
  const metresPerPixel = calibration * verticalMetres / (torsoFraction * videoHeight);
  const diameter = width / mask.width * videoWidth * metresPerPixel;
  return Number.isFinite(diameter) && diameter > 0 ? diameter : null;
}

/** Ramanujan's ellipse perimeter approximation uses both measured diameters. */
export function waistCircumferenceIn(frontM: number, sideM: number): number {
  const sum = (frontM + sideM) / 2;
  const h = ((frontM - sideM) / (frontM + sideM)) ** 2;
  return Math.PI * sum * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h))) / 0.0254;
}

export function collectWaistSample(capture: WaistCapture, diameterM: number | null) {
  if (diameterM === null) {
    capture.samples.length = 0;
    return;
  }
  capture.samples.push(diameterM);
  if (capture.samples.length > 12) capture.samples.shift();
  const diameter = stableMedian(capture.samples);
  if (diameter !== null) capture.onComplete(diameter);
}
