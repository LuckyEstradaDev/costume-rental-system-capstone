/* eslint-disable react-hooks/refs */
import {useRef} from "react";
import type {RefObject} from "react";
import {createRuntime} from "../runtime";
import type {ARRuntime, CalibrationSample} from "../types";
import type {WebcamHandle} from "../components/WebCam";
import {useGarmentModel} from "./useGarmentModel";
import {usePoseTracking} from "./usePoseTracking";
import {useRenderer} from "./useRenderer";
import type {MeasurementRequest} from "../lib/measurementCapture";

type Options = {
  measurementRequest: RefObject<MeasurementRequest | null>;
  modelUrl: string;
  containerRef: RefObject<HTMLDivElement | null>;
  webcamRef: RefObject<WebcamHandle | null>;
  poseDebugRef: RefObject<HTMLCanvasElement | null>;
  calibrationFactor: {current: number};
  cardShoulderRef: RefObject<number | null>;
  calibrationSample: {current: CalibrationSample};
  setStatus: (message: string) => void;
};

/**
 * Wires the three AR lifecycles together: renderer, garment model and pose
 * tracking all read from the same runtime object. Kept separate so each concern
 * can be read (and tuned) on its own.
 */
export function useARTracking(options: Options): void {
  const {
    modelUrl,
    containerRef,
    webcamRef,
    poseDebugRef,
    calibrationFactor,
    calibrationSample,
    setStatus,
  } = options;

  // The runtime is imperative mutable state (WebGL + pose refs); a ref keeps it
  // stable across renders without re-rendering when the loop updates it.
  const runtimeRef = useRef<ARRuntime | null>(null);
  if (!runtimeRef.current) {
    runtimeRef.current = createRuntime(calibrationFactor, calibrationSample);
  }
  const runtime = runtimeRef.current;

  useRenderer(runtime, containerRef, webcamRef);
  useGarmentModel(runtime, modelUrl, setStatus);
  usePoseTracking(runtime, webcamRef, poseDebugRef, setStatus, options.measurementRequest, options.cardShoulderRef);
}
