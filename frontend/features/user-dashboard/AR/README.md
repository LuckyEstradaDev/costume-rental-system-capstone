# AR Virtual Try-On

This feature overlays a 3D garment on the shopper's webcam feed and tells them
whether a chosen size fits. It runs entirely in the browser: Three.js renders the
garment, MediaPipe Pose estimates the body, and a small amount of math maps one
onto the other.

If you are new to this folder, read in this order:

1. `index.tsx` and `ARRoot.tsx` (public surface + what is rendered)
2. `types.ts` (the vocabulary)
3. `runtime.ts` (the shared state object)
4. `hooks/` (the three lifecycles)
5. `lib/` (pure logic)
6. `components/` (UI only)

---

## 1. Big picture

```text
                        webcam (react-webcam)
                                 |
             +-------------------+--------------------+
             |                                        |
      usePoseTracking                         useRenderer (Three.js)
   (MediaPipe, ~30 Hz)                      (requestAnimationFrame, 60 Hz)
             |                                        |
     measureBody() -> smoothBody()                    |
     updateOverlayTargets() -----> runtime -----> animate(): ease toward targets
             |                        |               and render scene
      publishFit()                   |
             |                       +--- useGarmentModel: GLTF + bones
      React state (chip/toast)                    (loads once per modelUrl)
```

Two loops run independently:

- **Detection loop** (fast enough to track, throttled to ~30 Hz): reads the pose,
  writes *desired* values into `runtime.targets`.
- **Render loop** (display rate): eases the garment toward those targets. It never
  waits for inference, so the model stays smooth even when detection is slow.

React is only used for UI state (status text, fit chip, toast, size buttons).
The frame-by-frame values never go through React state on purpose.

---

## 2. Folder map

| Path | Responsibility |
| --- | --- |
| `index.tsx` | Public entrypoint. Exports `AR`, `ARProps`, `GarmentMeasurements`. Import from `@/features/user-dashboard/AR`, not deep paths. |
| `ARRoot.tsx` | Wires state + hooks, renders the layout (webcam, canvas host, HUD). No math. |
| `config.ts` | All tuning numbers. Start here before changing behaviour. |
| `types.ts` | Shared types. The `ARRuntime` bag and the easing vocabulary live here. |
| `runtime.ts` | `createRuntime()` builds the mutable object shared by all hooks. |
| `hooks/useARTracking.ts` | Composes the three lifecycle hooks and mirrors props into `runtime.refs`. |
| `hooks/useRenderer.ts` | Creates the WebGL renderer, handles resize/DPR, runs the render loop. |
| `hooks/useGarmentModel.ts` | Loads the GLB, binds the rig, adds/removes it from the scene. |
| `hooks/usePoseTracking.ts` | Starts MediaPipe, runs detection, feeds measurements + targets. |
| `hooks/useCalibration.ts` | ID-card calibration UI state, countdown, sampling, persistence. |
| `lib/modelRig.ts` | Finds bones, measures the model, captures the arm rest pose, scene lights. |
| `lib/overlayTargets.ts` | Converts landmarks into scale / yaw / roll / arm / position targets. |
| `lib/poseMath.ts` | Arm IK-ish solver: screen angles -> bone Z rotations. |
| `lib/bodyFit.ts` | Body measurements, size chart, fit verdict. Pure functions, inches at boundaries. |
| `lib/fitFeedback.ts` | Smoothing + debounce; turns measurements into chip/toast state. |
| `lib/calibration.ts` | Reference-object math + localStorage. No React/Three. |
| `lib/objectFit.ts` | Maps the camera stream's `contain` box to on-screen pixels. |
| `utils/anchors.ts` | Landmark -> 3D anchor plane. |
| `utils/math.ts` | `shortestAngle`, `smoothAlpha`. |
| `components/` | Presentational only: `WebCam`, `Hud` (chip/toast/size), `CalibrationPanel`, `tones`. |

---

## 3. The shared runtime (most important concept)

`createRuntime()` returns one object that every hook reads and writes **by
reference**. It is mutable on purpose: touching React state every frame would
re-render the tree 30-60 times a second.

```ts
type ARRuntime = {
  scene, camera, clock;      // Three.js world
  rig;                       // loaded garment + bones + measurements
  videoRect;                 // where the camera image sits on screen
  targets;                   // DESIRED values written by pose tracking
  applied;                   // SMOOTHED values the render loop applies
  seeds;                     // "snap on next frame" flags
  body;                      // smoothed measurements used for fit
  windows;                   // median pre-filter buffers
  fit;                       // debounce state for chip/toast
  refs;                      // mirrors of React props (size, measurements, calibration)
  scratch;                   // reused Vector3s (no per-frame allocation)
  updateVideoRect;           // assigned by the renderer, used by pose tracking
};
```

Understand these five groups and the rest of the folder is easy:

| Field | Meaning | Who writes | Who reads |
| --- | --- | --- | --- |
| `targets` | Where the garment *should* be this instant. | `lib/overlayTargets.ts` | `useRenderer` loop |
| `applied` | Where it *currently* is, after easing. | `useRenderer` loop | `overlayTargets` (yaw foreshortening) |
| `seeds` | One-shot "snap instead of ease" switches. | both loops | both loops |
| `refs` | Latest React props, mirrored so loops see them without re-subscribing. | `useARTracking` effects | pose/fit code |
| `scratch` | Preallocated vectors. Reuse, never keep a reference past the call. | both loops | both loops |

Why `seeds`? When tracking is (re)acquired or the window is resized, easing from
an old position looks like the garment flies in. Clearing a seed makes the next
frame copy the target directly.

> The two `eslint-disable react-hooks/*` lines exist because this bag is
> intentionally mutable. Do not "fix" them by moving the runtime into
> `useState`; that re-renders on every pose frame.

---

## 4. Lifecycle, in order

1. `ARRoot` mounts and calls `useARTracking`.
2. `useARTracking` lazily creates the runtime once and mirrors props into
   `runtime.refs` (picked size, offered sizes, real measurements, calibration).
3. `useRenderer` creates the `WebGLRenderer`, pins the canvas CSS box, starts the
   render loop and wires resize / orientation / DPR listeners.
4. `useGarmentModel` loads the GLB, resets its transform, calls `bindModelRig`
   (bones, shoulder width, height, arm rest), then adds it to the scene.
5. `usePoseTracking` loads MediaPipe (GPU, falling back to CPU), then starts a
   `requestAnimationFrame` loop that detects at ~30 Hz.
6. Each detection:
   - `measureBody` (metres) -> `smoothBody` (median window + EMA)
   - `publishFit` -> React chip/toast (debounced)
   - `updateOverlayTargets` -> `runtime.targets`
7. Each animation frame: ease `targets` -> `applied` on the model and render.

Until the model is loaded `runtime.rig.shirt` is `null`, and the render loop
simply skips the garment. The rest of the pipeline is already running.

---

## 5. Coordinates and the DPI gotcha

- MediaPipe landmarks are normalized `0..1` of the camera frame, `y` pointing
  down. The webcam is mirrored, so `x` is flipped when mapping.
- `computeVideoFit` implements CSS `object-fit: contain` (letterbox). The whole
  camera frame is always visible, which keeps the full body in view on both the
  mobile full-screen view and the desktop 16:9 modal.
- `landmarkToWorld` first maps a normalized point through that letterbox rect,
  flips x/y, unprojects through the camera at `ANCHOR_DEPTH` (1.5 world units).
- Model units are metres (`METERS_PER_MODEL_UNIT = 1`).
- A `<canvas>` is a replaced element: if you only set the drawing-buffer size,
  the browser uses that pixel size as its CSS size. At `devicePixelRatio != 1`
  the overlay then drifts from the video. `useRenderer` therefore pins CSS
  `width/height/inset` to the container and only lets the buffer scale with DPR.
- DPR can change without a `resize` event (monitor switch, browser zoom), so the
  renderer also watches `matchMedia("(resolution: Xdppx)")`.

---

## 6. What the pose loop computes

`lib/overlayTargets.ts` writes these targets:

| Target | How |
| --- | --- |
| **Scale** | Convert projected shoulder width to world units per metre. Correct yaw foreshortening with `cos(yaw)`, or use the shoulder-to-hip span when hips are visible. Then apply the outfit's real shoulder / `outfitLength` measurements for the picked size. |
| **Yaw** | 3D angle between the world-space shoulder line and the camera. `YAW_SIGN` flips direction if the garment turns the wrong way. |
| **Roll** | Shoulder tilt, measured in 3D so it stays stable side-on. |
| **Arms** | `limbAngles` converts screen angles; `solveArm` applies them as a delta from the captured rest pose and divides out yaw. Hidden limbs ease back to rest. |
| **Position** | Measures where the garment's shoulder bones are in the world after the previous frame, then shifts the target so they land on the detected shoulder midpoint. |

Visibility gates (`SHOULDER_VIS_MIN`, `HIP_VIS_MIN`, `LIMB_VIS_MIN`) keep noisy
frames from moving the garment; the last good targets stay applied.

The render loop then eases each value with `smoothAlpha(dt, tau)` and snaps on
the first frame / after a `seed` reset.

---

## 7. Calibration (ID card)

MediaPipe's absolute scale is inferred from an assumed field of view and an
average-human prior, so it can be off by a lot. To correct it we need one known
length in the same image:

1. The user holds a landscape ID card (CR80, 85.6 mm long edge) flat **against
   their chest** at shoulder height, facing the camera.
2. The on-screen guide is drawn at exactly 10% of the camera frame's width
   (`ID_CARD_FRAME_FRACTION`), with the card's aspect ratio.
3. After `I'm ready`, a 10-second countdown runs, then ~1 second of samples.
4. `computeCalibration` uses:
   `trueShoulderM = referenceM * shoulderFrac / refFrac`
   then `factor = trueShoulderM / mediapipeShoulderM`.
5. The factor is persisted in `localStorage` (`ar:calibration:v1`). A factor
   outside the plausible band still applies but the panel warns the user.
6. The factor is applied **only to the fit verdict**, not to garment rendering.
   "Reset" returns to `1`.

Calibration is opened automatically on a first visit (no stored value).

---

## 8. Fit verdict pipeline

```text
world landmarks (metres)
  -> measureBody()        // shoulder + optional torso/hip, sanity-checked
  -> medianWindow() x5    // removes blur / single-frame spikes
  -> EMA (MEASURE_TAU_MS)
  -> publishFit()
       -> apply calibration factor to the body numbers
       -> evaluateFit()   // inches, real garment data first, chart fallback
       -> debounce         // 600 ms warning, 400 ms fit; instant on size change
  -> setFitChip / setFitToast
```

- Sizing is judged in **inches**; conversion happens once, in
  `bideltoidFromJoint` / `evaluateFit`.
- Real per-size garment measurements (from the outfit payload) take priority
  over the generic size chart; when they are missing, results are marked
  `estimated` in the label.
- The measured size is kept in `body.size` and passed back in as the previous
  size, which adds hysteresis so the chip does not flicker at boundaries.
- Hips/torso are optional: an upper-body framing still produces a shoulder-based
  size estimate.

---

## 9. Model requirements

- A `.glb` with a skeleton. Bone names are normalized (lowercase, non-alphanumerics
  stripped), so `arm.l` and `arml` both match.
- Recognized bones: upper arms (`arml`/`armr`, `upperarml`/`upperarmr`), forearms
  (`forearml`/`forearmr`, `lowerarml`/`lowerarmr`), shoulders (`shoulderl`/
  `shoulderr`), and a root/spine (`rootjoint`, `spine3`, `neutralbone`).
- If no root and no full arm rig are found, the mesh is rendered as a static
  overlay and a console warning is logged.
- The rig is authored at size `M` (`BASE_GARMENT_SIZE`) and 1 unit = 1 metre.
- Missing shoulder/height measurements fall back to safe defaults.

---

## 10. Tuning

Everything numeric lives in `config.ts` unless noted.

| Goal | Change |
| --- | --- |
| Snappier / smoother garment | `*_TAU_MS` (smaller = snappier) |
| Garment height / depth | `GARMENT_Y_OFFSET`, `ANCHOR_DEPTH` |
| Turn direction | `YAW_SIGN` |
| Shoulder stretch | `SHOULDER_WIDEN` |
| Detection rate | `DETECT_INTERVAL_MS` |
| Trust thresholds | `SHOULDER_VIS_MIN`, `HIP_VIS_MIN`, `LIMB_VIS_MIN` |
| Calibration guide size | `ID_CARD_FRAME_FRACTION`, `ID_CARD_ASPECT` |
| Fit tolerance / chart | `SHOULDER_TOL_IN`, `SIZE_CHART`, `SIZE_MIDPOINT`, `SIZE_HYSTERESIS` in `lib/bodyFit.ts` |
| Warning latency | `FIT_CONFIRM_MS`, `FIT_CONFIRM_OK_MS` |
| Fit copy / UI | `lib/bodyFit.ts` (toasts) and `components/` |

---

## 11. Debugging

- Console tags: `[bones]`, `[model]`, `[arms]` (rig load), `[scale]` (size
  changes), `[fit]` (accepted verdict), `[pose]` (GPU/CPU delegate).
- No garment? Check `[bones] resolved`, the model URL, and that the mesh was
  exported with an armature.
- Garment offset from the body? Check `computeVideoFit` output and the canvas
  CSS box first, then calibration.
- Fit chip never appears? Check that the outfit has a `shoulder` measurement for
  at least one size (the page filters AR sizes on this).
- `ENABLE_IDLE_TEST = true` drives the bones with a sine wave, useful to confirm
  rendering/rigging without a camera pose.
- The MediaPipe WASM loads from a CDN and the model from
  `public/models/pose_landmarker_full.task`; camera access needs `localhost` or
  HTTPS.

---

## 12. Glossary

- **Landmark**: one MediaPipe body point (shoulders are 11/12, hips 23/24,
  elbows 13/14, wrists 15/16).
- **Bideltoid width**: seam-to-seam shoulder width. MediaPipe gives joint-to-joint,
  so `SHOULDER_JOINT_TO_BIDELTOID_IN` bridges the difference.
- **Target / applied / seed**: desired value / eased current value / snap flag.
- **Anchor depth**: the fixed world plane the garment is projected onto.
- **Object-fit rect**: where the `contain`-fitted video is drawn inside its box.
- **Calibration factor**: multiplier that corrects MediaPipe's metric scale; `1`
  means uncalibrated.
