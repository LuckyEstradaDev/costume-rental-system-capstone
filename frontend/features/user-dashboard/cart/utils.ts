import {IPackageSnapshot} from "../package/types/IPackageSnapshot";
import type {Snapshot} from "./types/ISnapshot";

export const getCartItemKey = (
  item: Snapshot | IPackageSnapshot,
  index: number,
) => `${item.name}-${index}`;
