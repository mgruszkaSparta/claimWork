import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../../mobile/styles/globals.css";

export const metadata: Metadata = {
  manifest: "/mobile-manifest.json",
};

export default function MobileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
