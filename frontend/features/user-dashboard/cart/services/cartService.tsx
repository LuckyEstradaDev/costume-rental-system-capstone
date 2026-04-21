import {api} from "@/lib/axios";
import {ICartItem} from "../types/ICart";

export const fetchCartItemsService = async () => {
  return api.get("/api/cart/");
};

export const addToCartService = async (data: ICartItem) => {
  return api.post("/api/cart/", data);
};
