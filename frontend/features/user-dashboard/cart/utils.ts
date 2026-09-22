import type {IPackageCartItem} from "../package/types/IPackageCartItem";
import type {Snapshot} from "./types/ISnapshot";

export const getCartItemKey = (
  item: Snapshot | IPackageCartItem,
  index: number,
) => `${item.name}-${index}`;
