"use client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {OutfitModal} from "@/features/admin-dashboard/inventory-tab/components/OutfitModal";
import OutfitAnalytics from "@/features/admin-dashboard/inventory-tab/components/OutfitAnalytics";
import OutfitCard from "@/features/admin-dashboard/inventory-tab/components/OutfitCard";
import {useOutfit} from "@/features/admin-dashboard/inventory-tab/hooks/useOutfit";
import {OutfitProvider} from "@/features/admin-dashboard/inventory-tab/providers/OutfitProvider";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {useEffect, useState} from "react";

export default function Page() {
  const [outfits, setOutfits] = useState<IOutfit[]>([]);

  useEffect(() => {
    const fetchOufits = async () => {
      const {data} = await fetchOutfitsService();
      setOutfits(data);
    };

    fetchOufits();
  }, []);

  return (
    <OutfitProvider>
      <InventoryPageContent outfits={outfits} />
    </OutfitProvider>
  );
}

function InventoryPageContent({outfits}: {outfits: IOutfit[]}) {
  const {setModalOpen} = useOutfit();

  return (
    <>
      <div className="flex">
        <OutfitAnalytics />
      </div>
      <div className="flex items-center">
        <Input placeholder="Search" />
        <Button onClick={() => setModalOpen(true)}>Add Outfit</Button>

        <OutfitModal />
      </div>
      {outfits.map((item) => {
        return <OutfitCard key={item._id} data={item} />;
      })}
    </>
  );
}
