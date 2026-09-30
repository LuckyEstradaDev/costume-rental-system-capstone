"use client";

import {useEffect, useRef} from "react";
import {ChevronDown, LogOut, Menu, UserCircle2} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useAdminHeaderSlots} from "@/features/admin-dashboard/components/AdminHeaderSlots";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {signOutService} from "@/features/auth/services/signOutService";

interface AdminHeaderProps {
  /** Opens the off-canvas sidebar. Only rendered below the `md` breakpoint. */
  onOpenNav: () => void;
}

/**
 * The fixed admin header: the nav trigger, the current page's title and primary
 * controls, and the account menu.
 *
 * The title and controls are not this component's to describe - they arrive by
 * portal from whichever page is mounted, into the two slots below. It is the bar
 * that stays put, so it is `sticky` against the viewport rather than a separate
 * sticky element each page had to remember to render.
 *
 * The bar is auto-height: a page's description renders under its title, so the
 * height differs from page to page. It publishes its measured height as
 * `--admin-header-height` so the sidebar's brand block can stretch to match and
 * the floating slicer chip can clear it. Both read that one variable instead of
 * hardcoding a height that would only ever be right on one page.
 *
 * `min-h-18` keeps the bar from collapsing to a single line on a page with no
 * description. The sidebar is `fixed` on its own and spans the full viewport,
 * so it needs no counterpart here, and the bar needs no `md:left-72` either -
 * the layout's column already clears the sidebar.
 *
 * The z-order ladder the layout depends on: slicer chip `z-20` < header `z-30` <
 * mobile scrim `z-40` < sidebar `z-50`, so opening the nav on a small screen
 * dims the bar and the sidebar sits above both.
 */
export function AdminHeader({onOpenNav}: AdminHeaderProps) {
  const {setAuthenticated, setUser, user} = useAuth();
  const {setActionsSlot, setTitleSlot} = useAdminHeaderSlots();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);

  // The bar is auto-height because a page's description sits under its title, so
  // the bar's height differs from page to page. Two things have to line up with
  // it and neither is a sibling in the DOM: the sidebar's brand block (fixed, so
  // it cannot inherit a flex sibling's height) and the floating slicer chip
  // (fixed to the viewport, so it is positioned against the bar's top edge).
  // Publishing the measured height once as a variable is what keeps all three
  // agreeing without any of them knowing about the others.
  useEffect(() => {
    const node = headerRef.current;
    if (!node) {
      return;
    }

    const root = document.documentElement;
    // `offsetHeight` rather than the entry's `contentRect`: the latter is the
    // content box and so excludes the bar's own padding and border, which would
    // publish a height a few pixels short of the real one and leave the sidebar
    // and the chip visibly off. One measurement path for both calls.
    const publish = () => {
      root.style.setProperty("--admin-header-height", `${node.offsetHeight}px`);
    };

    publish();

    const observer = new ResizeObserver(publish);
    observer.observe(node);

    return () => {
      observer.disconnect();
      root.style.removeProperty("--admin-header-height");
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutService();
    } catch (error) {
      console.error(error);
    }

    setUser(null);
    setAuthenticated(false);
    router.push("/login");
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 flex min-h-18 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm md:px-6"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-lg border-primary/20 text-primary md:hidden"
        onClick={onOpenNav}
        aria-label="Open admin navigation"
      >
        <Menu className="size-5" />
      </Button>

      <div ref={setTitleSlot} className="min-w-0 flex-1" />
      <div ref={setActionsSlot} className="flex shrink-0 items-center gap-2" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex cursor-pointer items-center gap-3 rounded-lg py-1.5 pl-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:pr-3"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <UserCircle2 className="size-4" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-semibold">
                {user?.firstName + " " + user?.lastName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 sm:hidden">
            <p className="truncate text-sm font-semibold">
              {user?.firstName + " " + user?.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <DropdownMenuSeparator className="sm:hidden" />

          <DropdownMenuItem asChild>
            <Link href="/admin/profile">
              <UserCircle2 className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
            <LogOut className="size-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
