"use client";

import {Lock} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {useAuth} from "../hooks/useAuth";
import {useRouter} from "next/navigation";

export function AuthRequiredDialog() {
  const {isAuthModalOpen, openAuthModal} = useAuth();
  const router = useRouter();
  return (
    <Dialog open={isAuthModalOpen} onOpenChange={openAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center sm:items-start sm:text-left">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>
            You need an account to access this feature. Log in or create a free
            account to continue.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={() => router.push("/login")}>
            Log in
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/register")}
          >
            Create an account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
