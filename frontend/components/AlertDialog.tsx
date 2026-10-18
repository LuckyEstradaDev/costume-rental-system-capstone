import {useState} from "react";
import {Loader2} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AlertDialogComponent({
  children,
  action,
  isLoading,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  actionLabel = "Continue",
}: {
  children: React.ReactNode;
  action: () => void | Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const busy = Boolean(isLoading) || isWorking;

  const handleAction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Radix auto-closes the dialog from a composed click handler that bails out
    // when default is prevented. Keeping it open makes the working state visible
    // and, together with `busy`, guarantees the action can only run once.
    event.preventDefault();
    if (busy) return;

    setIsWorking(true);
    try {
      await action();
      setOpen(false);
    } catch (error) {
      // Stay open: the caller surfaces an error toast and the user can retry.
      console.error(error);
    } finally {
      setIsWorking(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    // Blocks every close request (Cancel, Esc, outside click) while working.
    if (!nextOpen && busy) return;
    setOpen(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Working…
              </>
            ) : (
              actionLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
