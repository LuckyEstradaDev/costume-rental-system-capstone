import {DrawingUtils, PoseLandmarker} from "@mediapipe/tasks-vision";
import type {ARVideoRect} from "../types";

type Landmark = {x: number; y: number; z?: number; visibility?: number};

export type PoseDebugReadout = {
  shoulderM: number | null;
  torsoM: number | null;
  hipM: number | null;
  chestCircumferenceM: number | null;
  sleeveM: number | null;
  size: string | null;
};

const M_TO_IN = 1 / 0.0254;
const PAD = 10;

const inches = (metres: number | null) =>
  metres === null || !Number.isFinite(metres) ? "—" : `${(metres * M_TO_IN).toFixed(1)} in`;

/** Draws MediaPipe landmarks/connectors plus the live body readout on a 2D canvas. */
export function drawPoseDebug(
  canvas: HTMLCanvasElement,
  videoRect: ARVideoRect | null,
  landmarks: Landmark[],
  readout: PoseDebugReadout,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cssW = canvas.clientWidth;
  const cssH = canvas.clientHeight;
  if (!cssW || !cssH) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bufferW = Math.round(cssW * dpr);
  const bufferH = Math.round(cssH * dpr);
  if (canvas.width !== bufferW || canvas.height !== bufferH) {
    canvas.width = bufferW;
    canvas.height = bufferH;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, bufferW, bufferH);
  if (!videoRect || landmarks.length === 0) return;

  const toBuffer = (point: Landmark) => ({
    x: (videoRect.offsetX + (1 - point.x) * videoRect.drawW) / videoRect.w,
    y: (videoRect.offsetY + point.y * videoRect.drawH) / videoRect.h,
    z: point.z ?? 0,
    visibility: point.visibility ?? 1,
  });
  const mapped = landmarks.map(toBuffer);

  const drawing = new DrawingUtils(ctx);
  drawing.drawConnectors(mapped, PoseLandmarker.POSE_CONNECTIONS, {
    color: "#22c55e",
    lineWidth: 2 * dpr,
  });
  drawing.drawLandmarks(mapped, {
    color: "#ef4444",
    fillColor: "#ef4444",
    radius: 3 * dpr,
  });

  const lines = [
    `Shoulders (tailored) ${inches(readout.shoulderM)}`,
    `Chest (circ.) ${inches(readout.chestCircumferenceM)}`,
    `Hips ${inches(readout.hipM)}`,
    `Torso ${inches(readout.torsoM)}`,
    `Sleeve ${inches(readout.sleeveM)}`,
    readout.size ? `Size ${readout.size}` : null,
  ].filter((line): line is string => line !== null);

  const fontSize = 14 * dpr;
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  const lineHeight = fontSize * 1.4;
  const panelW = Math.max(...lines.map((line) => ctx.measureText(line).width)) + PAD * 2 * dpr;
  const panelH = lines.length * lineHeight + PAD * 2 * dpr;
  const panelX = bufferW - panelW - PAD * dpr;
  const panelY = PAD * dpr + 48 * dpr;

  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 8 * dpr);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  lines.forEach((line, index) => {
    ctx.fillText(line, panelX + PAD * dpr, panelY + PAD * dpr + index * lineHeight);
  });
}
