"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// A pill whose outline turns into a marching dashed border on hover. Renders
// a Next.js link when given an href, otherwise a button.

type SizeVariant = "sm" | "default" | "lg" | "xl";

type FlowButtonProps = {
  children: React.ReactNode;
  size?: SizeVariant;
  borderColor?: string;
  className?: string;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">)
  | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
);

const sizeMap: Record<SizeVariant, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  default: "h-9 px-4 text-sm",
  lg: "h-10 px-6 text-sm",
  xl: "h-12 min-w-40 px-6 text-[15px]",
};

// A pill's outline: straight top and bottom, half-circle ends. Inset by half
// the stroke so the 1px line isn't clipped at the edges.
const pillPath = (w: number, h: number) => {
  const r = h / 2;
  return `M${r},0.5 H${w - r} A${r - 0.5},${r - 0.5} 0 0 1 ${w - r},${h - 0.5} H${r} A${r - 0.5},${r - 0.5} 0 0 1 ${r},0.5 Z`;
};

function FlowButton({
  children,
  size = "default",
  borderColor = "var(--muted-foreground)",
  className,
  ...props
}: FlowButtonProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(() =>
      setBox({ width: host.offsetWidth, height: host.offsetHeight }),
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const classes = cn(
    "relative z-0 inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-surface font-medium text-foreground transition-colors duration-200 hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    sizeMap[size],
    className,
  );

  return (
    <div ref={hostRef} className="group relative inline-block">
      <style>{`@keyframes dash-flow { to { stroke-dashoffset: -10; } }`}</style>
      <div className="pointer-events-none absolute inset-[2px] z-10 opacity-0 transition-all duration-200 ease-out group-hover:inset-0 group-hover:opacity-100">
        {box.width > 0 && (
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${box.width} ${box.height}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            <path
              d={pillPath(box.width, box.height)}
              fill="none"
              stroke={borderColor}
              strokeWidth="1"
              strokeDasharray="6,4"
              className="group-hover:animate-[dash-flow_1s_linear_infinite] motion-reduce:animate-none"
            />
          </svg>
        )}
      </div>
      {props.href !== undefined ? (
        <Link {...props} className={classes}>
          {children}
        </Link>
      ) : (
        <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} className={classes}>
          {children}
        </button>
      )}
    </div>
  );
}

export { FlowButton };
export type { FlowButtonProps };
