import {IPackageSnapshot} from "../../package/types/IPackageSnapshot";
import {Snapshot} from "./ISnapshot";

export type ICartItem = {
  userId: string;
  items: (Snapshot | IPackageSnapshot)[];
};
