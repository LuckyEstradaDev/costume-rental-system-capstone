import type {IPackageCartItem} from "./IPackageCartItem.js";

export type IPackageCart = {
  userId: string;
  packageItems: IPackageCartItem[];
};