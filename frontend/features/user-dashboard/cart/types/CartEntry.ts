import type {IPackageCartItem} from "@/features/user-dashboard/package/types/IPackageCartItem";
import type {Snapshot} from "./ISnapshot";

/**
 * Unified entry for the merged cart list (single outfits + packages).
 * - kind: "outfit"  -> a single costume line item (Snapshot)
 * - kind: "package" -> a package snapshot added to the package cart (IPackageCartItem)
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
      pkg: IPackageCartItem;
    };