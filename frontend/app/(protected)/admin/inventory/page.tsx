"use client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {AddOutfitModal} from "@/features/admin-dashboard/components/inventory-tab/AddOutfitModal";
import OutfitAnalytics from "@/features/admin-dashboard/components/inventory-tab/OutfitAnalytics";
import OutfitCard from "@/features/admin-dashboard/components/inventory-tab/OutfitCard";
import {Plus} from "lucide-react";
import {useState} from "react";

export default function Page() {
  const [isAddOutfitOpen, setAddOutfitOpen] = useState(false);
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
      <OutfitCard></OutfitCard>
    </>
  );
}
