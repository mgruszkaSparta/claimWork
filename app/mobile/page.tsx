"use client";

import dynamic from "next/dynamic";

const MobileApp = dynamic(() => import("../../mobile/App"), { ssr: false });

export default function MobilePage() {
  return <MobileApp />;
}
