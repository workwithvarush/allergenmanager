"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

/** How long the "Back online" confirmation stays up. */
const RECONNECTED_MS = 4000;

const iconProps = {
  className: "banner-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/**
 * Warns while the device has no connection, then briefly confirms when it
 * returns (`.banner-warn` / `.banner-success` in kit.css). Renders nothing
 * otherwise, apart from an empty live region so the first change is announced.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  // The browser only fires "online" after a disconnect, so it marks a reconnection.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onOnline = () => {
      setShowReconnected(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowReconnected(false), RECONNECTED_MS);
    };
    const onOffline = () => {
      clearTimeout(timer);
      setShowReconnected(false);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <div role="status">
      {!online && (
        <div className="banner banner-warn">
          <svg {...iconProps}>
            <path d="M12 18l.01 0" />
            <path d="M9.172 15.172a4 4 0 0 1 5.656 0" />
            <path d="M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2" />
            <path d="M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374" />
            <path d="M3 3l18 18" />
          </svg>
          <div className="banner-body">
            <div className="banner-title">No connection</div>
            <div>Changes can&apos;t be saved or printed until the connection returns.</div>
          </div>
        </div>
      )}
      {online && showReconnected && (
        <div className="banner banner-success">
          <svg {...iconProps}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div className="banner-body">Back online.</div>
        </div>
      )}
    </div>
  );
}
