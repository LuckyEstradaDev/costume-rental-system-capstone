import type {IPackageSnapshot} from "@/features/user-dashboard/package/types/IPackageSnapshot";
import type {Snapshot} from "./ISnapshot";

/**
 * Unified entry for the merged cart list (single outfits + packages).
 * - kind: "outfit"  -> a single costume line item (Snapshot)
 * - kind: "package" -> a package snapshot added to the package cart (IPackageSnapshot)
 *
 * The list is displayed merged and sorted by `createdAt` (newest first).
 */
export type CartEntry =
  | {
      kind: "outfit";
      item: Snapshot;
    }
  | {
      kind: "package";
      pkg: IPackageSnapshot;
    };