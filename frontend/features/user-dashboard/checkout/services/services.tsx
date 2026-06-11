import {api} from "@/lib/axios";

export const fetchStripeSession = (data: {
  paymentID: string;
  userID: string;
  orderID: string;
}) => {
  return api.post("/api/stripe/create-checkout-session", data);
};
