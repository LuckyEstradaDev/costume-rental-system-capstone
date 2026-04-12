"use client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {AddOutfitModal} from "@/features/admin-dashboard/inventory-tab/components/AddOutfitModal";
import OutfitAnalytics from "@/features/admin-dashboard/inventory-tab/components/OutfitAnalytics";
import OutfitCard from "@/features/admin-dashboard/inventory-tab/components/OutfitCard";
import { fetchOutfitsService } from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import { IOutfit } from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {Plus} from "lucide-react";
import {useEffect, useState} from "react";

export default function Page() {
  const [isAddOutfitOpen, setAddOutfitOpen] = useState(false);
  const [outfits, setOutfits] = useState<IOutfit[]>([]);
  useEffect(() => {
    const fetchOufits = async () => {
      const {data} = await fetchOutfitsService()
      setOutfits(data)
    }

    fetchOufits()
  }, [])
  return (
    <>
      <div className="flex">
        <OutfitAnalytics></OutfitAnalytics>
      </div>
      <div className="flex items-center">
        <Input placeholder="Search"></Input>

        <AddOutfitModal
          onOpenChange={setAddOutfitOpen}
          open={isAddOutfitOpen}
        ></AddOutfitModal>
      </div>
      {outfits.map(item => {
        return (
          <OutfitCard key={item._id} data={item}></OutfitCard>
        )
      })}
    </>
  );
}
