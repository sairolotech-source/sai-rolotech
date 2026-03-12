import { useState, useCallback, type ReactNode, type MouseEvent, type CSSProperties } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleCounter = 0;

interface RippleIconProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  as?: "div" | "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

export default function RippleIcon({
  children,
  className = "",
  onClick,
  as = "button",
  href,
  target,
  rel,
  style,
  ...rest
}: RippleIconProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;
      const id = ++rippleCounter;

      setRipples((prev) => [...prev, { id, x, y, size }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);

      onClick?.(e);
    },
    [onClick],
  );

  const rippleElements = ripples.map((r) => (
    <span
      key={r.id}
      className="ripple-circle"
      style={{
        left: r.x - r.size / 2,
        top: r.y - r.size / 2,
        width: r.size,
        height: r.size,
      }}
    />
  ));

  const commonProps = {
    className: `ripple-host ${className}`,
    onClick: handleClick,
    style,
    ...rest,
  };

  if (as === "a") {
    return (
      <a href={href} target={target} rel={rel} {...commonProps}>
        {children}
        {rippleElements}
      </a>
    );
  }

  if (as === "button") {
    return (
      <button type="button" {...commonProps}>
        {children}
        {rippleElements}
      </button>
    );
  }

  return (
    <div {...commonProps}>
      {children}
      {rippleElements}
    </div>
  );
}
