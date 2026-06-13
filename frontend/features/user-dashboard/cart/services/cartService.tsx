import {api} from "@/lib/axios";
import {ICartItem} from "../types/ICart";

export const fetchCartItemsService = async (id: string) => {
  return api.get(`/api/cart/${id}`);
};

export const addToCartService = async (data: ICartItem) => {
  return api.post("/api/cart/", data);
};

export const removeFromCartService = async (
  userId: string,
  variantId: string,
  size: string,
) => {
  return api.delete(
    `/api/cart/${userId}/item/${variantId}/${encodeURIComponent(size)}`,
  );
};
