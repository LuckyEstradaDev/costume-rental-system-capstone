"use client";

import {AlertDialogComponent} from "@/components/AlertDialog";
import {Button} from "@/components/ui/button";
import {useNotification} from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {MoreHorizontal, Pencil, Trash} from "lucide-react";
import {useState} from "react";
import {deleteOutfitByIdService} from "../services/outfitService";
import {useOutfit} from "../hooks/useOutfit";
import {IOutfit} from "../types/IOutfit";
import {useMutation, useQueryClient} from "@tanstack/react-query";

export function CardDropdownMenu({outfit}: {outfit: IOutfit}) {
  const client = useQueryClient();
  const {setModalOpen, setIsEdit, setOutfit} = useOutfit();
  const {notify} = useNotification();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteOutfitMutation = useMutation({
    mutationFn: deleteOutfitByIdService,
    onSuccess: () => {
      client.invalidateQueries({queryKey: ["outfits"]});
    },
  });

  const handleOufitDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteOutfitMutation.mutateAsync(outfit._id!);
      notify({
        title: "Outfit deleted",
        description: "The outfit was removed from inventory.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      notify({
        title: "Delete failed",
        description: "Unable to delete outfit. Please try again.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
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
          aria-label={`Actions for ${outfit.name}`}
          className="absolute right-3 top-3 z-10 h-9 w-9 rounded-lg bg-background/90 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36 rounded-lg p-1">
        <DropdownMenuItem
          onClick={handleEditOutfit}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <AlertDialogComponent action={handleOufitDelete} isLoading={isDeleting}>
          <DropdownMenuItem
            onSelect={(event) => event.preventDefault()}
            className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </AlertDialogComponent>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
