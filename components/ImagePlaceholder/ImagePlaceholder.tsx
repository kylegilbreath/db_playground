import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export const IMAGE_PLACEHOLDER_SRC = "/images/imagePlaceholder.svg";

export type ImagePlaceholderProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
> & {
  size?: number | string;
};

/**
 * ImagePlaceholder
 *
 * Matches the Figma `[image]` placeholder (node `23146:3951`).
 * Intended for demos / empty logo slots.
 */
export function ImagePlaceholder({ size = 16, className, style, ...rest }: ImagePlaceholderProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      alt=""
      aria-hidden="true"
      className={cx("pointer-events-none block object-cover", className)}
      src={IMAGE_PLACEHOLDER_SRC}
      style={{ width: size, height: size, ...style }}
    />
  );
}

