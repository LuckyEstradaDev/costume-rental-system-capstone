// One-off generator for the bundled Philippine Standard Geographic Code (PSGC)
// dataset used by the address picker. Run from the frontend folder:
//
//   node scripts/generate-psgc.mjs
//
// It pulls the four public PSGC collections, strips them down to the fields the
// UI needs, and writes public/data/psgc.json. The generated file is committed so
// the app never calls the PSGC API at runtime.

import {mkdir, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const BASE = "https://psgc.gitlab.io/api";
const OUTPUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/data/psgc.json",
);

const fetchJson = async (path) => {
  const res = await fetch(`${BASE}/${path}/`);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  return res.json();
};

const main = async () => {
  console.log("Fetching PSGC data...");
  const [regions, provinces, cities, barangays] = await Promise.all([
    fetchJson("regions"),
    fetchJson("provinces"),
    fetchJson("cities-municipalities"),
    fetchJson("barangays"),
  ]);

  const data = {
    regions: regions.map((region) => ({
      code: region.code,
      name: region.name,
    })),
    provinces: provinces.map((province) => ({
      code: province.code,
      name: province.name,
      regionCode: province.regionCode,
    })),
    cities: cities.map((city) => ({
      code: city.code,
      name: city.name,
      provinceCode: typeof city.provinceCode === "string" ? city.provinceCode : "",
      regionCode: city.regionCode,
      isCity: Boolean(city.isCity),
    })),
    barangays: barangays.map((barangay) => ({
      code: barangay.code,
      name: barangay.name,
      cityCode:
        (typeof barangay.cityCode === "string" && barangay.cityCode) ||
        (typeof barangay.municipalityCode === "string"
          ? barangay.municipalityCode
          : ""),
    })),
  };

  await mkdir(dirname(OUTPUT), {recursive: true});
  await writeFile(OUTPUT, JSON.stringify(data), "utf8");

  console.log(
    `Wrote ${OUTPUT} (regions: ${data.regions.length}, provinces: ${data.provinces.length}, cities: ${data.cities.length}, barangays: ${data.barangays.length})`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
