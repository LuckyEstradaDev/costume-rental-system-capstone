import assert from "node:assert/strict";
import {test} from "node:test";
import {bideltoidFromJoint, evaluateFit, M_TO_IN, measureBody, normalizeOutfitSizes} from "./bodyFit";
import {captureSteadyValues, type MeasurementRequest} from "./measurementCapture";
import {calibrationStorageKey, computeCalibration, stableMedian} from "./calibration";
import {smoothBody} from "./fitFeedback";
import type {ARRuntime} from "../types";
import {collectWaistSample, waistCircumferenceIn, waistDiameter, type WaistCapture, type WaistView} from "./waistScan";
import {getOutfitArFit} from "../../browse-tab/utils/outfitAr";
import type {IOutfit} from "../../../admin-dashboard/inventory-tab/types/IOutfit";

const point = (x: number, y: number, z = 0) => ({x, y, z, visibility: 1});

function frame(view: WaistView, aspect = 1) {
  const pose = Array.from({length: 33}, () => point(0.5, 0.1));
  const world = pose.map(() => point(0, 0));
  for (const [shoulder, hip, sign] of [[11, 23, -1], [12, 24, 1]]) {
    const x = view === "front" ? sign * 0.16 : 0;
    const z = view === "side" ? sign * 0.16 : 0;
    world[shoulder] = point(x, 0, z);
    world[hip] = point(x, 0.5, z);
    pose[shoulder] = point(0.5 + x / aspect, 0.2);
    pose[hip] = point(0.5 + x / aspect, 0.7);
  }
  const width = 200 * aspect;
  const height = 200;
  const diameter = view === "front" ? 60 : 40;
  const pixels = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const start = y * width + (width - diameter) / 2;
    pixels.fill(1, start, start + diameter);
  }
  const mask = {width, height, getAsFloat32Array: () => pixels};
  return {pose, world, mask, pixels, width, height};
}

function scan(view: WaistView, f = frame(view), factor = 1) {
  return waistDiameter(view, f.pose, f.world, f.mask, f.width, f.height, factor);
}

test("Measure waits one second and captures calibrated values that remain fixed when live readings change", () => {
  const samples: MeasurementRequest["samples"] = [];
  const {pose} = frame("front");
  const body = {shoulderWidth: 0.4, torsoLength: 0.5, sleeveLength: 0.6};
  const cardShoulder = 0.32;
  const scale = cardShoulder / body.shoulderWidth;
  const sample = (time: number) => captureSteadyValues(samples, body, pose, 1, time, cardShoulder);
  for (let at = 0; at < 1000; at += 100) assert.equal(sample(at), null);
  const captured = sample(1000);
  assert.ok(captured);
  body.torsoLength = 0.9;
  assert.equal(captured.shoulderIn, bideltoidFromJoint(cardShoulder));
  assert.equal(captured.torsoIn, 0.5 * scale * M_TO_IN);
  assert.equal(captured.sleeveIn, 0.6 * scale * M_TO_IN + 3);
  const sleeveFit = evaluateFit(captured.body, null, "M", ["M"], {M: {sleeveLength: captured.sleeveIn}}, "Barong");
  assert.equal(sleeveFit.criteria.find((item) => item.key === "sleeve")?.kind, "fits");
  const chart = {S: {shoulder: 15, waist: 28}, M: {shoulder: 17, waist: 32}};
  const fit = (size: string) => evaluateFit(captured.body, null, size, Object.keys(chart), chart, "Gown", 31);
  const original = fit("S");
  body.shoulderWidth = 0.65;
  body.sleeveLength = 0.3;
  samples.length = 0;
  assert.deepEqual(captured.body, {shoulderWidth: cardShoulder, torsoLength: 0.5 * scale, sleeveLength: 0.6 * scale});
  assert.deepEqual(fit("S"), original);
  assert.equal(original.criteria.find((item) => item.key === "waist")?.kind, "too-tight");
  assert.equal(fit("M").criteria.find((item) => item.key === "waist")?.kind, "fits");
});

test("fresh card readings distinguish two wearers even when their later pose estimates match", () => {
  const {pose} = frame("front");
  const body = {shoulderWidth: 0.4, torsoLength: 0.5, sleeveLength: 0.6};
  function captureWearer(shoulderFrac: number, mediapipeShoulderM: number) {
    const card = computeCalibration({refFrac: 0.1, shoulderFrac, mediapipeShoulderM});
    assert.ok(card);
    const samples: MeasurementRequest["samples"] = [];
    for (let at = 0; at < 1000; at += 100) {
      assert.equal(captureSteadyValues(samples, body, pose, 1, at, card.trueShoulderM), null);
    }
    const captured = captureSteadyValues(samples, body, pose, 1, 1000, card.trueShoulderM);
    assert.ok(captured);
    assert.equal(captured.body.shoulderWidth, card.trueShoulderM);
    assert.equal(captured.shoulderIn, bideltoidFromJoint(card.trueShoulderM));
    return {card, captured};
  }
  const first = captureWearer(0.4, 0.32);
  const second = captureWearer(0.5, 0.4);
  assert.ok(Math.abs(first.card.factor - second.card.factor) < 1e-10);
  assert.ok(second.captured.shoulderIn > first.captured.shoulderIn);
  assert.ok(second.captured.torsoIn > first.captured.torsoIn);
  assert.ok(second.captured.sleeveIn > first.captured.sleeveIn);
});

test("movement, missing joints, and a stalled camera restart the stillness window", () => {
  const samples: MeasurementRequest["samples"] = [];
  const {pose} = frame("front");
  const body = {shoulderWidth: 0.4, torsoLength: 0.5, sleeveLength: 0.6};
  const sample = (time: number) => captureSteadyValues(samples, body, pose, 1, time, 0.4);
  for (let at = 0; at <= 900; at += 100) assert.equal(sample(at), null);
  pose[15].x += 0.2;
  assert.equal(sample(1000), null);
  assert.equal(samples.length, 1);
  sample(1100);
  sample(1100);
  assert.equal(samples.length, 2);
  assert.equal(sample(2000), null);
  assert.equal(samples.length, 1);
  assert.equal(captureSteadyValues(samples, {...body, torsoLength: null}, pose, 1, 2100, 0.4), null);
  assert.equal(samples.length, 0);
});

test("slow cameras can complete a capture, and unstable readings cannot lock", () => {
  const samples: MeasurementRequest["samples"] = [];
  const {pose} = frame("front");
  const sample = (at: number, sleeveLength: number) => captureSteadyValues(
    samples, {shoulderWidth: 0.4, torsoLength: 0.5, sleeveLength}, pose, 1, at, 0.4,
  );
  for (let i = 0; i < 16; i++) assert.equal(sample(i * 200, i % 2 ? 0.4 : 0.7), null);
  samples.length = 0;
  for (let i = 0; i < 7; i++) assert.equal(sample(4000 + i * 200, 0.6), null);
  assert.ok(sample(5400, 0.6));
});

test("front width and side depth use the calibrated physical scale across aspect ratios", () => {
  for (const aspect of [0.75, 1, 2]) {
    assert.ok(Math.abs((scan("front", frame("front", aspect)) ?? 0) - 0.3) < 1e-6);
    assert.ok(Math.abs((scan("side", frame("side", aspect), 1.25) ?? 0) - 0.25) < 1e-6);
  }
  assert.ok(Math.abs(waistCircumferenceIn(0.3, 0.3) - Math.PI * 0.3 / 0.0254) < 1e-6);
  assert.ok(waistCircumferenceIn(0.3, 0.26) > waistCircumferenceIn(0.3, 0.18));
});

test("a wrong angle, a cropped silhouette or an arm across the waist cannot produce a diameter", () => {
  assert.equal(scan("front", frame("side")), null);
  assert.equal(scan("side", frame("front")), null);
  const cropped = frame("front");
  cropped.pixels.fill(1);
  assert.equal(scan("front", cropped), null);
  const occluded = frame("front");
  occluded.pose[13] = point(0.5, 0.4);
  occluded.pose[15] = point(0.5, 0.7);
  assert.equal(scan("front", occluded), null);
});

test("capture requires multiple stable readings and restarts after losing the silhouette", () => {
  let accepted: number | null = null;
  const capture: WaistCapture = {view: "front", samples: [], onComplete: (value) => { accepted = value; }, onUnavailable() {}};
  for (let i = 0; i < 7; i++) collectWaistSample(capture, 0.3);
  assert.equal(accepted, null);
  collectWaistSample(capture, null);
  assert.equal(capture.samples.length, 0);
  for (let i = 0; i < 8; i++) collectWaistSample(capture, 0.3);
  assert.equal(accepted, 0.3);
  assert.equal(stableMedian([1, 2, 1, 2, 1, 2, 1, 2]), null);
});

test("a 100% calibration is valid and calibration keys distinguish customers and cameras", () => {
  assert.equal(computeCalibration({referenceM: 0.1, refFrac: 0.1, shoulderFrac: 0.4, mediapipeShoulderM: 0.4})?.factor, 1);
  assert.notEqual(calibrationStorageKey("a", "one"), calibrationStorageKey("b", "one"));
  assert.notEqual(calibrationStorageKey("a", "one"), calibrationStorageKey("a", "two"));
  assert.equal(calibrationStorageKey("a"), null);
});

test("same shoulders with different waists can select different gown sizes, while a manual pick is respected", () => {
  const body = {shoulderWidth: 0.33, torsoLength: null, sleeveLength: null};
  const sizes = {S: {shoulder: 17, waist: 28}, M: {shoulder: 17, waist: 32}, L: {shoulder: 17}};
  const fit = (waist: number | null, pick?: string) => evaluateFit(body, null, pick, Object.keys(sizes), sizes, "Gown", waist);
  assert.equal(fit(27).size, "S");
  assert.equal(fit(31).size, "M");
  assert.deepEqual(fit(31, "S").criteria.map(({key, kind}) => [key, kind]), [["shoulder", "fits"], ["waist", "too-tight"]]);
  assert.equal(fit(31, "L").criteria[1].kind, "unknown");
  assert.equal(fit(null, "M").criteria[1].kind, "unknown");
  assert.equal(evaluateFit(null, null, null, ["M"], sizes, "Gown", 30).size, "M");
});

test("image landmarks outside the camera frame cannot supply sleeve or torso measurements", () => {
  const f = frame("front");
  f.pose[15].x = -0.1;
  f.pose[16].visibility = 0.1;
  f.pose[23].y = 1.1;
  const measured = measureBody(f.world, f.pose);
  assert.ok(measured && measured.shoulderWidth > 0);
  assert.equal(measured.sleeveLength, null);
  assert.equal(measured.torsoLength, null);
});

test("hidden measurements expire independently and reacquisition starts a fresh sample window", () => {
  const state: Pick<ARRuntime, "body" | "windows" | "lastMeasuredAt"> = {
    body: {shoulder: null, torso: null, sleeve: null},
    windows: {shoulder: [], torso: [], sleeve: []},
    lastMeasuredAt: {shoulder: 0, torso: 0, sleeve: 0},
  };
  const tracked = {shoulderWidth: 0.4, torsoLength: 0.5, sleeveLength: 0.6};
  smoothBody(state, tracked, 0.2, 100);
  smoothBody(state, {...tracked, sleeveLength: null}, 0.2, 300);
  assert.equal(state.body.sleeve, 0.6);
  smoothBody(state, {...tracked, sleeveLength: null}, 0.2, 800);
  assert.equal(state.body.shoulder, 0.4);
  assert.equal(state.body.sleeve, null);
  smoothBody(state, {...tracked, sleeveLength: 0.7}, 0.2, 850);
  assert.equal(state.body.sleeve, 0.7);
  smoothBody(state, null, 0.2, 1400);
  assert.equal(state.body.shoulder, null);
  assert.deepEqual(state.windows, {shoulder: [], torso: [], sleeve: []});
});

test("waist-only sizes use the selected color and include extended sizes", () => {
  const variants = [28, 38].map((waist) => ({color: String(waist), sizes: [{size: "XXL", stock: 1, measurements: {waist}}]}));
  const outfit: IOutfit = {name: "Gown", category: "Gown", fabricType: "", description: "", modelURL: "gown.glb", variants};
  const ar = getOutfitArFit(outfit, variants[1]);
  assert.equal(ar.canTryInAR, true);
  assert.equal(ar.sizeMeasurements.XXL.waist, 38);
  assert.deepEqual(normalizeOutfitSizes(["3XL", ...ar.arSizes]), ["XXL", "3XL"]);
  assert.deepEqual(normalizeOutfitSizes(["3XL", "2XL", "XL"]), ["XL", "2XL", "3XL"]);
});
