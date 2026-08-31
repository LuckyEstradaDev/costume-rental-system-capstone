import {api} from "@/lib/axios";
import {ICartItem} from "../types/ICart";

export const fetchCartItemsService = async (id: string): Promise<ICartItem> => {
  const res = await api.get<ICartItem>(`/api/cart/${id}`);
  return res.data;
};

export const addToCartService = async (data: ICartItem) => {
  return api.post("/api/cart/", data);
};

export const removeFromCartService = async ({
  userId,
  variantId,
  size,
}: {
  userId: string;
  variantId: string;
  size: string;
}) => {
  return api.delete(
    `/api/cart/${userId}/item/${variantId}/${encodeURIComponent(size)}`,
  );
};
