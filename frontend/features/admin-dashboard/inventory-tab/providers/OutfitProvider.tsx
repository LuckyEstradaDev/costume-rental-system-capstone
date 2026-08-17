import {useState} from "react";
import {createContext} from "react";
import {IOutfit} from "../types/IOutfit";

type IOutfitContext = {
  outfit: IOutfit | null;
  setOutfit: (outfit: IOutfit) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
};

export const OutfitContext = createContext<IOutfitContext | undefined>(
  undefined,
);

export function OutfitProvider({children}: {children: React.ReactNode}) {
  const [selectedOutfit, setSelectedOutfit] = useState<IOutfit | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  return (
    <OutfitContext.Provider
      value={{
        outfit: selectedOutfit,
        setOutfit: setSelectedOutfit,
        isModalOpen,
        setModalOpen,
        isEdit,
        setIsEdit,
      }}
    >
      {children}
    </OutfitContext.Provider>
  );
}
