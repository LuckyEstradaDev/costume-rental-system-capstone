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

export function CardDropdownMenu({
  onEdit,
  outfitId,
}: {
  onEdit?: () => void;
  outfitId: string;
}) {
  const handleOufitDelete = async () => {
    try {
      await deleteOutfitByIdService(outfitId);
      alert("Deleted Successfully");
    } catch (error) {
      console.log(error);
    }
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
          onClick={onEdit}
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
