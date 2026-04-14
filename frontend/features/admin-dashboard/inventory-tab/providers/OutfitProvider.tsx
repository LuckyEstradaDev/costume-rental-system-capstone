import {useState} from "react";
import {createContext} from "react";
import {IOutfit} from "../types/IOutfit";

type IOutfitContext = {
  outfit: IOutfit | null;
  setOutfit: (outfit: IOutfit) => void;
  isEditModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
};

export const OutfitContext = createContext<IOutfitContext | undefined>(
  undefined,
);

export function OutfitProvider({children}: {children: React.ReactNode}) {
  const [selectedOutfit, setSelectedOutfit] = useState<IOutfit | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  return (
    <OutfitContext.Provider
      value={{
        outfit: selectedOutfit,
        setOutfit: setSelectedOutfit,
        isEditModalOpen,
        setEditModalOpen,
      }}
    >
      {children}
    </OutfitContext.Provider>
  );
}
