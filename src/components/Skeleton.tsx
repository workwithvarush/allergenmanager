import type { CSSProperties, ReactNode } from "react";

type Size = number | string;

type SkeletonProps = {
  /** "rect" (default) for blocks, "text" for lines of copy, "circle" for avatars and icons. */
  shape?: "rect" | "text" | "circle";
  width?: Size;
  height?: Size;
  /** For shape="text": number of lines; the last one is shortened like a real paragraph. */
  lines?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Grey shimmering stand-in for content that is still loading (`.skeleton` in kit.css).
 * Hidden from screen readers — wrap a group of them in <LoadingPlaceholder> to announce it.
 */
export function Skeleton({ shape = "rect", width, height, lines = 1, className, style }: SkeletonProps) {
  const base = ["skeleton", shape !== "rect" ? `skeleton-${shape}` : null, className].filter(Boolean).join(" ");
  const size: CSSProperties = {
    width: width ?? (shape === "circle" ? height : "100%"),
    height: height ?? (shape === "circle" ? width : shape === "rect" ? 16 : undefined),
    ...style,
  };

  if (shape === "text" && lines > 1) {
    return (
      <span className="skeleton-lines" aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={base} style={{ ...size, width: i === lines - 1 ? "60%" : size.width }} />
        ))}
      </span>
    );
  }
  return <span className={base} style={size} aria-hidden="true" />;
}

type LoadingPlaceholderProps = {
  /** Read out to screen readers, e.g. "Loading today's events". */
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Wraps skeletons for an area that is loading. Screen readers hear `label`
 * once instead of a run of empty shapes.
 */
export function LoadingPlaceholder({ label, children, className, style }: LoadingPlaceholderProps) {
  return (
    // No aria-busy here: it tells screen readers to hold announcements, and this
    // region is swapped out rather than "finishing", so the label would be lost.
    <div role="status" className={className} style={style}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
