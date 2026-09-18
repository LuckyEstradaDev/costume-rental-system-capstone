import type {Snapshot} from "./ISnapshot.js";

export type ICartItem = {
  userId: string;
  items: Snapshot[];
};
