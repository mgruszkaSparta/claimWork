"use client";

import dynamic from "next/dynamic";
import { NotificationsProvider } from "../../mobile/hooks/useNotifications";

const MobileApp = dynamic(() => import("../../mobile/App"), { ssr: false });

export default function MobilePage() {
  return (
    <NotificationsProvider>
      <MobileApp />
    </NotificationsProvider>
  );
}
