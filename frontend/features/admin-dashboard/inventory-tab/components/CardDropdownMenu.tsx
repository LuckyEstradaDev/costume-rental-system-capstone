import {AlertDialogComponent} from "@/components/AlertDialog";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {MoreHorizontal, Pencil, Trash} from "lucide-react";
import {deleteOutfitByIdService} from "../services/outfitService";
import {useOutfit} from "../hooks/useOutfit";
import {IOutfit} from "../types/IOutfit";

export function CardDropdownMenu({outfit}: {outfit: IOutfit}) {
  const {setModalOpen, setIsEdit, setOutfit, refreshOutfits} = useOutfit();
  const handleOufitDelete = async () => {
    try {
      await deleteOutfitByIdService(outfit._id!);
      await refreshOutfits();
      alert("Deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to delete outfit. Please try again.");
    }
  };

  const handleEditOutfit = () => {
    setIsEdit(true);
    setOutfit(outfit);
    setModalOpen(true);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36 rounded-xl p-1">
        <DropdownMenuItem
          onClick={handleEditOutfit}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <AlertDialogComponent action={handleOufitDelete}>
          <DropdownMenuItem
            onSelect={(event) => event.preventDefault()}
            className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
          >
            <Trash className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </AlertDialogComponent>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
