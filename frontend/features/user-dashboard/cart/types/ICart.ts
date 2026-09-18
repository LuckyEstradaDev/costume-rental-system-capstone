import {Snapshot} from "./ISnapshot";

export type ICartItem = {
  userId: string;
  items: Snapshot[];
};
