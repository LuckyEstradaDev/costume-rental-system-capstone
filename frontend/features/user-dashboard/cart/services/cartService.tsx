import {api} from "@/lib/axios";
import {ICartItem} from "../types/ICart";

export const fetchCartItemsService = async (id: string) => {
  return api.get(`/api/cart/${id}`);
};

export const addToCartService = async (data: ICartItem) => {
  return api.post("/api/cart/", data);
};
