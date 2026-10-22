"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DiscardChangesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the edits are thrown away. */
  onDiscard: () => void;
  /** What is being edited, used in the description. */
  subject: "outfit" | "package" | "bundle";
};

/**
 * Asks before a form with unsaved edits is thrown away.
 *
 * It is rendered next to the dialog it guards, so it opens as a second layer
 * on top of it - the guarded dialog ignores outside clicks while this one is
 * open and therefore never closes behind it.
 */
export function DiscardChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  subject,
}: DiscardChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            This {subject} has edits that have not been saved. Discarding them
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDiscard}>
            Discard changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
