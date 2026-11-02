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
 * Letterbox fit: always show the whole camera frame (contain) so the entire
 * body stays visible in both the full-screen mobile view and the desktop modal,
 * regardless of the container's shape. Returns null until the container and the
 * stream both have real dimensions.
 */
export function computeVideoFit(
  containerW: number,
  containerH: number,
  videoW: number,
  videoH: number,
): VideoFitRect | null {
  if (!containerW || !containerH || !videoW || !videoH) return null;

  const fit: VideoFit = "contain";
  const scale = Math.min(containerW / videoW, containerH / videoH);
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
