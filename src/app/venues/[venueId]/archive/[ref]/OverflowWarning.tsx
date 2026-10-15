"use client";

import { useEffect, useState } from "react";

/**
 * Pages are split by estimated heights; if one still overflows (unusually long
 * entries), say so rather than let entries be cut off the printed record.
 */
export function OverflowWarning() {
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const check = () => {
      const boxes = document.querySelectorAll<HTMLElement>("[data-archive-page]");
      setOverflowing([...boxes].some((box) => box.scrollHeight > box.clientHeight + 1));
    };
    check();
    // Fonts arriving can change line wrapping.
    void document.fonts?.ready.then(check);
  }, []);

  return (
    <div role="alert">
      {overflowing && (
        <div className="banner banner-danger" style={{ margin: "16px 28px 0" }}>
          <div className="banner-body">
            <div className="banner-title">Part of this archive doesn&apos;t fit its pages</div>
            Some entries would be cut off when printed. Please report this so the page layout can be fixed.
          </div>
        </div>
      )}
    </div>
  );
}
