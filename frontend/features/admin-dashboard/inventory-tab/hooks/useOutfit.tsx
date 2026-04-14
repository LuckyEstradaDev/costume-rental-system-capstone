import {useContext} from "react";
import {OutfitContext} from "../providers/OutfitProvider";

export function useOutfit() {
  const context = useContext(OutfitContext);

  if (!context) {
    throw new Error("useOutfit must be used within OutfitProvider");
  }

  return context;
}
