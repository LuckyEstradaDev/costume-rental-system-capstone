/**
 * Object-fit aware mapping between the camera stream's intrinsic pixels and the
 * on-screen container box. Shared by the AR render loop (which maps MediaPipe
 * landmarks onto the canvas) and the calibration guides (which map dragged
 * container pixels back to the video frame), so the two can never drift apart.
 */

export type VideoFit = "cover" | "contain";

export type VideoFitRect = {
  /** placement of the drawn video inside the container, in CSS px */
  offsetX: number;
  offsetY: number;
  /** size of the drawn video, in CSS px */
  drawW: number;
  drawH: number;
  fit: VideoFit;
};

/**
 * Adaptive fit: letterbox (contain) when the viewport is portrait so the whole
 * body stays visible, otherwise fill-and-crop (cover). Returns null until the
 * container and the stream both have real dimensions.
 */
export function computeVideoFit(
  containerW: number,
  containerH: number,
  videoW: number,
  videoH: number,
): VideoFitRect | null {
  if (!containerW || !containerH || !videoW || !videoH) return null;

  const fit: VideoFit = containerH > containerW ? "contain" : "cover";
  const scale =
    fit === "cover"
      ? Math.max(containerW / videoW, containerH / videoH)
      : Math.min(containerW / videoW, containerH / videoH);
  const drawW = videoW * scale;
  const drawH = videoH * scale;

  return {
    offsetX: (containerW - drawW) / 2,
    offsetY: (containerH - drawH) / 2,
    drawW,
    drawH,
    fit,
  };
}
