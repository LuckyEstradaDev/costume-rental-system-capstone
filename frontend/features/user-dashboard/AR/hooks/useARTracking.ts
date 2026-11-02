/* eslint-disable react-hooks/refs */
import {useEffect, useRef} from "react";
import type {RefObject} from "react";
import type {GarmentMeasurements} from "../lib/bodyFit";
import {createRuntime} from "../runtime";
import type {ARRuntime, CalibrationSample, FitChipState, FitToastState} from "../types";
import type {WebcamHandle} from "../components/WebCam";
import {useGarmentModel} from "./useGarmentModel";
import {usePoseTracking} from "./usePoseTracking";
import {useRenderer} from "./useRenderer";

type Options = {
  modelUrl: string;
  sizes?: readonly string[];
  sizeMeasurements?: Record<string, GarmentMeasurements>;
  pickedSize: string | null;
  containerRef: RefObject<HTMLDivElement | null>;
  webcamRef: RefObject<WebcamHandle | null>;
  calibrationFactor: {current: number};
  calibrationSample: {current: CalibrationSample};
  setStatus: (message: string) => void;
  setFitChip: (state: FitChipState | null) => void;
  setFitToast: (state: FitToastState | null) => void;
};

/**
 * Wires the three AR lifecycles together: renderer, garment model and pose
 * tracking all read from the same runtime object. Kept separate so each concern
 * can be read (and tuned) on its own.
 */
export function useARTracking(options: Options): void {
  const {
    modelUrl,
    sizes,
    sizeMeasurements,
    pickedSize,
    containerRef,
    webcamRef,
    calibrationFactor,
    calibrationSample,
    setStatus,
    setFitChip,
    setFitToast,
  } = options;

  // The runtime is imperative mutable state (WebGL + pose refs); a ref keeps it
  // stable across renders without re-rendering when the loop updates it.
  const runtimeRef = useRef<ARRuntime | null>(null);
  if (!runtimeRef.current) {
    runtimeRef.current = createRuntime(calibrationFactor, calibrationSample);
  }
  const runtime = runtimeRef.current;

  useEffect(() => {
    runtime.refs.pickedSize.current = pickedSize;
  }, [runtime, pickedSize]);
  useEffect(() => {
    runtime.refs.sizes.current = sizes;
  }, [runtime, sizes]);
  useEffect(() => {
    runtime.refs.sizeMeasurements.current = sizeMeasurements;
  }, [runtime, sizeMeasurements]);

  useRenderer(runtime, containerRef, webcamRef);
  useGarmentModel(runtime, modelUrl, setStatus);
  usePoseTracking(runtime, webcamRef, setStatus, setFitChip, setFitToast);
}
