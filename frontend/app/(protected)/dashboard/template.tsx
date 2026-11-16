"use client";

import type React from "react";

import {PageTransition} from "@/components/motion";

export default function DashboardTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PageTransition>{children}</PageTransition>;
}
