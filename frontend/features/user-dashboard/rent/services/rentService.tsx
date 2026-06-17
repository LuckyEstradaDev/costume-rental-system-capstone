import {api} from "@/lib/axios";
import {IRent} from "../types/IRent";

export const placeRentService = async (rentData: Partial<IRent>) => {
  return api.post("/api/rents", rentData);
};
