import type {IPackageSnapshot} from "./IPackageSnapshot.js";
import type {Snapshot} from "./ISnapshot.js";

export type ICartItem = {
  userId: string;
  items: (Snapshot | IPackageSnapshot)[];
};
