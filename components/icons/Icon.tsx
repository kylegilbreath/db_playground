import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type IconProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  /**
   * File name (without extension) in `public/icons/`.
   * Example: `name="close"` resolves to `/icons/close.svg`.
   */
  name: string;
  /** Icon size in px (number) or any CSS length. Defaults to 16. */
  size?: number | string;
  /**
   * Accessibility:
   * - If `decorative` is true, the icon is hidden from screen readers.
   * - Otherwise, provide `aria-label` (preferred) or `title`.
   */
  decorative?: boolean;
};

/**
 * Icon
 *
 * Uses the SVG file in `public/icons/` as a CSS mask so the icon inherits
 * `currentColor` (set via `className="text-..."`).
 *
 * Best for single-color icons. For multi-color artwork, prefer an `<img />` or inline SVG.
 */
export function Icon({
  name,
  size = 16,
  decorative = true,
  className,
  style,
  title,
  ...rest
}: IconProps) {
  const url = `/icons/${name}.svg`;

  return (
    <span
      {...rest}
      aria-hidden={decorative ? true : undefined}
      className={cx("inline-block shrink-0 align-[-0.125em]", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: "currentColor",
        // Use the SVG as a mask so the icon inherits `currentColor`.
        // Important: explicitly request an alpha mask so icon color isn't
        // affected by the SVG's fill luminance (many of our assets are #6F6F6F).
        WebkitMaskImage: `url("${url}")`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url("${url}")`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
        maskMode: "alpha",
        ...style,
      }}
      title={decorative ? undefined : title}
    />
  );
}

