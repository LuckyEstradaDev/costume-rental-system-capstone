import type {IPackageSnapshot} from "./IPackageSnapshot.js";

export type IPackageCartItem = {
  userId: string;
  packageItems: IPackageSnapshot[];
};
