import type * as THREE from "three";
import type {ARVideoRect} from "../types";

/**
 * Maps a MediaPipe landmark (x, y in 0-1 of the camera stream) onto the anchor
 * plane, writing into `out` so no vectors are allocated per frame. The landmark
 * is placed through the video's on-screen (object-fit) rect, then flipped to
 * match the mirrored x and MediaPipe's downward y.
 */
export function landmarkToWorld(
  landmark: {x: number; y: number},
  camera: THREE.PerspectiveCamera,
  depth: number,
  videoRect: ARVideoRect | null,
  out: THREE.Vector3,
): THREE.Vector3 {
  let nx = landmark.x;
  let ny = landmark.y;
  if (videoRect) {
    nx = (videoRect.offsetX + landmark.x * videoRect.drawW) / videoRect.w;
    ny = (videoRect.offsetY + landmark.y * videoRect.drawH) / videoRect.h;
  }
  out.set(-(nx * 2 - 1), -(ny * 2 - 1), 0.5);
  out.unproject(camera);
  out.sub(camera.position).normalize();
  out.multiplyScalar((depth - camera.position.z) / out.z);
  return out.add(camera.position);
}
