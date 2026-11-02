import {useEffect} from "react";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {bindModelRig, createEmptyRig} from "../lib/modelRig";
import type {ARRuntime} from "../types";

/**
 * Loads the garment GLB, resolves its rig and exposes it through the runtime.
 * The render loop keeps running while it loads and simply skips the model until
 * `runtime.rig.shirt` is set.
 */
export function useGarmentModel(
  runtime: ARRuntime,
  modelUrl: string,
  setStatus: (message: string) => void,
): void {
  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        if (cancelled) return;
        const shirt = gltf.scene;
        if (!shirt) {
          console.error("Failed to load shirt model");
          return;
        }

        shirt.position.set(0, 0, 0);
        shirt.scale.set(1, 1, 1);
        shirt.rotation.set(0, 0, 0);

        const rig = bindModelRig(shirt, modelUrl);
        runtime.rig = rig;
        runtime.scene.add(shirt);
      },
      undefined,
      (error) => {
        console.error("Failed to load outfit model", modelUrl, error);
        if (!cancelled) setStatus("Failed to load the 3D model. Please try again.");
      },
    );

    return () => {
      cancelled = true;
      const shirt = runtime.rig.shirt;
      if (shirt) runtime.scene.remove(shirt);
      runtime.rig = createEmptyRig();
    };
  }, [runtime, modelUrl, setStatus]);
}
