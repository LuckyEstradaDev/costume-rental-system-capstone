import {useEffect} from "react";
import {Color, Points, PointsMaterial, SkeletonHelper} from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {BONE_DEBUG_COLOR, SHOW_ALIGNMENT_DEBUG} from "../config";
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
    let jointMaterial: PointsMaterial | null = null;
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
        shirt.visible = false;
        runtime.rig = rig;
        runtime.scene.add(shirt);

        if (SHOW_ALIGNMENT_DEBUG) {
          const skeleton = new SkeletonHelper(shirt);
          if (skeleton.geometry.getAttribute("position").count === 0) {
            skeleton.dispose();
            return;
          }

          const color = new Color(BONE_DEBUG_COLOR);
          skeleton.setColors(color, color);
          skeleton.visible = false;
          skeleton.frustumCulled = false;
          skeleton.renderOrder = 1;

          // The helper updates these endpoints whenever the garment rig moves.
          jointMaterial = new PointsMaterial({
            color,
            size: 5,
            sizeAttenuation: false,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            toneMapped: false,
          });
          const joints = new Points(skeleton.geometry, jointMaterial);
          joints.frustumCulled = false;
          joints.renderOrder = 2;
          skeleton.add(joints);
          rig.boneDebug = skeleton;
          runtime.scene.add(skeleton);
        }
      },
      undefined,
      (error) => {
        console.error("Failed to load outfit model", modelUrl, error);
        if (!cancelled) setStatus("Failed to load the 3D model. Please try again.");
      },
    );

    return () => {
      cancelled = true;
      const {shirt, boneDebug} = runtime.rig;
      if (shirt) runtime.scene.remove(shirt);
      boneDebug?.removeFromParent();
      boneDebug?.dispose();
      jointMaterial?.dispose();
      runtime.rig = createEmptyRig();
    };
  }, [runtime, modelUrl, setStatus]);
}
