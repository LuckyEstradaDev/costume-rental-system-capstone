"use client";

import {createContext, useCallback, useContext, useState} from "react";
import type {ReactNode} from "react";

interface AdminHeaderSlots {
  /** Where `AdminPageHeader` portals the page title. */
  title: HTMLElement | null;
  /** Where it portals the page's primary controls. */
  actions: HTMLElement | null;
}

const EMPTY: AdminHeaderSlots = {title: null, actions: null};

const AdminHeaderSlotsContext = createContext<{
  slots: AdminHeaderSlots;
  setTitleSlot: (node: HTMLElement | null) => void;
  setActionsSlot: (node: HTMLElement | null) => void;
}>({
  slots: EMPTY,
  setTitleSlot: () => {},
  setActionsSlot: () => {},
});

/**
 * Lets a page hand its title and primary controls up into the layout's fixed
 * header without the header having to know anything about any page.
 *
 * The alternative - a route table in the layout - cannot work: `actions` is
 * wired to each page's own filter state, and the title node is sometimes built
 * deep in the tree (`ProfileView` takes it as a `header` prop) rather than by
 * the page itself. A portal is indifferent to where the node was authored, so
 * every page keeps the same `<AdminPageHeader title actions />` call site.
 *
 * The slot divs mount with the header, which is behind the layout's auth gate,
 * so by the time a page renders the slots already exist. On the one commit
 * where they do not, `AdminPageHeader` renders nothing and the ref callback
 * re-renders it before paint.
 */
export function AdminHeaderSlotsProvider({children}: {children: ReactNode}) {
  const [slots, setSlots] = useState<AdminHeaderSlots>(EMPTY);

  // Ref callbacks fire on every commit, so each setter has to bail when the node
  // is unchanged or every unrelated render would schedule another one.
  const setTitleSlot = useCallback((node: HTMLElement | null) => {
    setSlots((current) => (current.title === node ? current : {...current, title: node}));
  }, []);

  const setActionsSlot = useCallback((node: HTMLElement | null) => {
    setSlots((current) =>
      current.actions === node ? current : {...current, actions: node},
    );
  }, []);

  return (
    <AdminHeaderSlotsContext.Provider
      value={{slots, setTitleSlot, setActionsSlot}}
    >
      {children}
    </AdminHeaderSlotsContext.Provider>
  );
}

export function useAdminHeaderSlots() {
  return useContext(AdminHeaderSlotsContext);
}
