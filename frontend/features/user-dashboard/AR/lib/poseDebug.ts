import {DrawingUtils, PoseLandmarker} from "@mediapipe/tasks-vision";
import {BONE_DEBUG_COLOR, POSE_DEBUG_COLOR, SHOW_ALIGNMENT_DEBUG} from "../config";
import type {ARVideoRect} from "../types";
import {adjustedSleeveIn, M_TO_IN} from "./bodyFit";

type Landmark = {x: number; y: number; z?: number; visibility?: number};

export type PoseDebugReadout = {
  shoulderM: number | null;
  torsoM: number | null;
  sleeveM: number | null;
};

const PAD = 10;

const inches = (metres: number | null, convert = (m: number) => m * M_TO_IN) =>
  metres === null || !Number.isFinite(metres) ? "awaiting view" : `${convert(metres).toFixed(1)} in`;

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

  if (SHOW_ALIGNMENT_DEBUG) {
    const mapped = landmarks.map((point) => ({
      x: 1 - (videoRect.offsetX + point.x * videoRect.drawW) / videoRect.w,
      y: (videoRect.offsetY + point.y * videoRect.drawH) / videoRect.h,
      z: point.z ?? 0,
      visibility: point.visibility ?? 1,
    }));
    const drawing = new DrawingUtils(ctx);
    drawing.drawConnectors(mapped, PoseLandmarker.POSE_CONNECTIONS, {
      color: POSE_DEBUG_COLOR,
      lineWidth: dpr,
    });
    drawing.drawLandmarks(mapped, {
      color: POSE_DEBUG_COLOR,
      fillColor: "transparent",
      lineWidth: 1.5 * dpr,
      radius: 5 * dpr,
    });
  }

  const lines = [
    {label: `Shoulder width · ${inches(readout.shoulderM)}`, color: "#ffffff"},
    {label: `Torso length · ${inches(readout.torsoM)}`, color: "#ffffff"},
    {label: `Sleeve length · ${inches(readout.sleeveM, adjustedSleeveIn)}`, color: "#ffffff"},
  ];
  if (SHOW_ALIGNMENT_DEBUG) {
    lines.push({label: "MediaPipe landmarks", color: POSE_DEBUG_COLOR});
    lines.push({label: "Model bones", color: BONE_DEBUG_COLOR});
  }

  const fontSize = 14 * dpr;
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  const lineHeight = fontSize * 1.4;
  const panelW = Math.max(...lines.map(({label}) => ctx.measureText(label).width)) + PAD * 2 * dpr;
  const panelH = lines.length * lineHeight + PAD * 2 * dpr;
  const panelX = bufferW - panelW - PAD * dpr;
  const panelY = PAD * dpr + 48 * dpr;

  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 8 * dpr);
  ctx.fill();

  ctx.textBaseline = "top";
  lines.forEach(({label, color}, index) => {
    ctx.fillStyle = color;
    ctx.fillText(label, panelX + PAD * dpr, panelY + PAD * dpr + index * lineHeight);
  });
}
