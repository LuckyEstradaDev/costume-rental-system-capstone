import type {IPackageCartItem} from "./IPackageCartItem";

export type IPackageCart = {
  userId: string;
  packageItems: IPackageCartItem[];
};