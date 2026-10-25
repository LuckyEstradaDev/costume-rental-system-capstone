import "../config/dotenvconfig.js";
import "dotenv/config";
import mongoose from "mongoose";
import {nanoid} from "nanoid";
import {connectDB} from "../config/db.js";

const MIGRATION_NAME = "backfill-outfit-package-reference-ids";

interface MigrationDoc {
  name: string;
  appliedAt: Date;
}

type ReferenceDocument = {
  _id: mongoose.Types.ObjectId;
  referenceID?: string | null;
};

const generateReferenceID = (prefix: "OUT" | "PKG") => {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${nanoid(6).toUpperCase()}`;
};

const backfillReferences = async (
  collectionName: "outfits" | "packages",
  prefix: "OUT" | "PKG",
) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not ready");
  }

  const collection = db.collection<ReferenceDocument>(collectionName);
  const existingReferences = new Set(
    (await collection.find({referenceID: {$exists: true}}).toArray())
      .map((document) => document.referenceID)
      .filter((referenceID): referenceID is string => Boolean(referenceID)),
  );
  const documents = await collection
    .find(
      {
        $or: [
          {referenceID: {$exists: false}},
          {referenceID: null},
          {referenceID: ""},
        ],
      },
      {projection: {_id: 1}},
    )
    .toArray();

  for (const document of documents) {
    let referenceID = generateReferenceID(prefix);
    while (existingReferences.has(referenceID)) {
      referenceID = generateReferenceID(prefix);
    }

    await collection.updateOne(
      {_id: document._id},
      {$set: {referenceID}},
    );
    existingReferences.add(referenceID);
  }

  await collection.createIndex(
    {referenceID: 1},
    {unique: true, sparse: true, name: "referenceID_1"},
  );

  return documents.length;
};

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

  const outfitsUpdated = await backfillReferences("outfits", "OUT");
  const packagesUpdated = await backfillReferences("packages", "PKG");

  await migrations.insertOne({
    name: MIGRATION_NAME,
    appliedAt: new Date(),
  });

  console.log(
    `Backfilled reference IDs for ${outfitsUpdated} outfit(s) and ${packagesUpdated} package(s).`,
  );

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
