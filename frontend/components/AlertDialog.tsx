import {useId, useRef, useState} from "react";
import {Checkbox} from "@/components/ui/checkbox";
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
  content,
  confirmationLabel,
}: {
  children: React.ReactNode;
  action: () => void | Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  content?: React.ReactNode;
  confirmationLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const confirmationId = useId();
  const actionInFlight = useRef(false);
  const busy = Boolean(isLoading) || isWorking;

  const handleAction = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Radix auto-closes the dialog from a composed click handler that bails out
    // when default is prevented. Keeping it open makes the working state visible
    // and, together with `busy`, guarantees the action can only run once.
    event.preventDefault();
    if (busy || actionInFlight.current || (confirmationLabel && !accepted)) return;

    actionInFlight.current = true;
    setIsWorking(true);
    try {
      await action();
      setOpen(false);
    } catch (error) {
      // Stay open: the caller surfaces an error toast and the user can retry.
      console.error(error);
    } finally {
      actionInFlight.current = false;
      setIsWorking(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    // Blocks every close request (Cancel, Esc, outside click) while working.
    if (!nextOpen && (busy || actionInFlight.current)) return;
    setAccepted(false);
    setOpen(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className={content ? "data-[size=default]:max-w-3xl" : undefined}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {content}
        {confirmationLabel && (
          <div className="flex items-start gap-3">
            <Checkbox
              id={confirmationId}
              checked={accepted}
              disabled={busy}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor={confirmationId} className="cursor-pointer text-base font-medium leading-relaxed text-secondary">
              {confirmationLabel}
            </label>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={busy || Boolean(confirmationLabel && !accepted)}>
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
