"use client";

import type {ComponentProps, ReactNode} from "react";
import {MoreHorizontal} from "lucide-react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

type CardDropdownMenuProps = {
  label: string;
  children: ReactNode;
  triggerId?: string;
  disabled?: boolean;
  modal?: boolean;
  onCloseAutoFocus?: ComponentProps<typeof DropdownMenuContent>["onCloseAutoFocus"];
};

export function CardDropdownMenu({
  label,
  children,
  triggerId,
  disabled,
  modal,
  onCloseAutoFocus,
}: CardDropdownMenuProps) {
  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>
        <Button
          id={triggerId}
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          disabled={disabled}
          className="size-9 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36 rounded-lg p-1" onCloseAutoFocus={onCloseAutoFocus}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
