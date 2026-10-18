import "../config/dotenvconfig.js";
import "dotenv/config";
import mongoose from "mongoose";
import {connectDB} from "../config/db.js";
import {OutfitModel} from "../models/OutfitModel.js";

const MIGRATION_NAME = "convert-measurements-cm-to-inches";
const CM_PER_INCH = 2.54;

const MEASUREMENT_KEYS = [
  "chest",
  "bust",
  "waist",
  "hips",
  "shoulder",
  "sleeveLength",
  "neck",
  "inseam",
  "outfitLength",
] as const;

interface MigrationDoc {
  name: string;
  appliedAt: Date;
}

const cmToInches = (value: number) =>
  Math.round((value / CM_PER_INCH) * 10) / 10;

const run = async () => {
  await connectDB();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not ready");
  }

  const migrations = db.collection<MigrationDoc>("migrations");
  const alreadyApplied = await migrations.findOne({name: MIGRATION_NAME});

  if (alreadyApplied) {
    console.log(
      `Migration "${MIGRATION_NAME}" already applied on ${alreadyApplied.appliedAt.toISOString()}. Nothing to do.`,
    );
    await mongoose.disconnect();
    return;
  }

  const outfits = await OutfitModel.find();
  let outfitsUpdated = 0;
  let valuesConverted = 0;

  for (const outfit of outfits) {
    let changed = false;

    for (const variant of outfit.variants) {
      for (const size of variant.sizes) {
        const measurements = size.measurements as
          | Record<string, number | undefined>
          | undefined;

        if (!measurements) continue;

        for (const key of MEASUREMENT_KEYS) {
          const current = measurements[key];
          if (typeof current !== "number" || current <= 0) continue;

          const converted = cmToInches(current);
          if (converted === current) continue;

          measurements[key] = converted;
          valuesConverted += 1;
          changed = true;
        }
      }
    }

    if (changed) {
      outfit.markModified("variants");
      await outfit.save();
      outfitsUpdated += 1;
    }
  }

  await migrations.insertOne({
    name: MIGRATION_NAME,
    appliedAt: new Date(),
  });

  console.log(
    `Converted ${valuesConverted} measurement value(s) across ${outfitsUpdated} outfit(s).`,
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
