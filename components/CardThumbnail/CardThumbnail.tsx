"use client";

import * as React from "react";
import Image from "next/image";

import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/icons";
import type { TagColor } from "@/components/Tag";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

const TAG_BG_CLASS: Record<TagColor, string> = {
  Default: "bg-tag-background-default",
  Charcoal: "bg-tag-background-charcoal",
  Lemon: "bg-tag-background-lemon",
  Lime: "bg-tag-background-lime",
  Teal: "bg-tag-background-teal",
  Turquoise: "bg-tag-background-turquoise",
  Indigo: "bg-tag-background-indigo",
  Purple: "bg-tag-background-purple",
  Pink: "bg-tag-background-pink",
  Coral: "bg-tag-background-coral",
  Brown: "bg-tag-background-brown",
};

const TAG_ICON_CLASS: Record<TagColor, string> = {
  Default: "text-tag-iconColor-default",
  Charcoal: "text-tag-iconColor-charcoal",
  Lemon: "text-tag-iconColor-lemon",
  Lime: "text-tag-iconColor-lime",
  Teal: "text-tag-iconColor-teal",
  Turquoise: "text-tag-iconColor-turquoise",
  Indigo: "text-tag-iconColor-indigo",
  Purple: "text-tag-iconColor-purple",
  Pink: "text-tag-iconColor-pink",
  Coral: "text-tag-iconColor-coral",
  Brown: "text-tag-iconColor-brown",
};

const TAG_TEXT_CLASS: Record<TagColor, string> = {
  Default: "text-tag-text-default",
  Charcoal: "text-tag-text-charcoal",
  Lemon: "text-tag-text-lemon",
  Lime: "text-tag-text-lime",
  Teal: "text-tag-text-teal",
  Turquoise: "text-tag-text-turquoise",
  Indigo: "text-tag-text-indigo",
  Purple: "text-tag-text-purple",
  Pink: "text-tag-text-pink",
  Coral: "text-tag-text-coral",
  Brown: "text-tag-text-brown",
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function getDashboardThumbnailSrcPair(index: number): { light: string; dark: string } {
  // Clamp to known assets (01-25) to avoid broken URLs in demos.
  const safe = Math.max(1, Math.min(25, Math.floor(index)));
  const nn = pad2(safe);
  return {
    light: `/dashboard-thumbnails/light/dashboard-thumbnail-light-${nn}.png`,
    dark: `/dashboard-thumbnails/dark/dashboard-thumbnail-dark-${nn}.png`,
  };
}

function truncateLines(code: string, maxLines: number) {
  const cleaned = maxLines > 0 ? maxLines : 1;
  const lines = code.split("\n");
  if (lines.length <= cleaned) return code;
  return lines.slice(0, cleaned).join("\n");
}

function normalizeIconNode(
  icon: React.ReactNode,
  {
    size,
    className,
  }: {
    size: number;
    className?: string;
  },
) {
  if (React.isValidElement(icon) && icon.type === Icon) {
    return React.cloneElement(
      icon as React.ReactElement<React.ComponentProps<typeof Icon>>,
      {
        size,
        className: cx((icon.props as { className?: string }).className, className),
      },
    );
  }
  return icon;
}

export type CardThumbnailProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & (
  | {
      variant: "placeholder";
      icon?: React.ReactNode;
      /** Optional Tag color overrides (background + icon), using the Tag palette. */
      tagColor?: TagColor;
    }
  | {
      variant: "textSnippet";
      text: string;
      /** Max lines before clamping. Defaults to 3 (matches the Figma preview). */
      lines?: number;
      /** Optional Tag color overrides (background + text), using the Tag palette. */
      tagColor?: TagColor;
    }
  | {
      variant: "image";
      alt?: string;
      /**
       * Next/Image sizes hint. Important for sharpness (prevents upscaling).
       * Defaults to a reasonable max width for our demo cards.
       */
      sizes?: string;
      /** Image quality (1-100). */
      quality?: number;
    } & (
      | { dashboardIndex: number }
      | { src: { light: string; dark: string } }
    )
  | {
      variant: "code";
      code: string;
      language?: string;
      highlightedTokens?: string[];
      /** Truncate to N lines to keep the thumbnail compact. Defaults to 5. */
      maxLines?: number;
    }
);

export function CardThumbnail(props: CardThumbnailProps) {
  const { className } = props;

  const baseClass =
    "relative flex h-[104px] w-[200px] shrink-0 overflow-hidden";

  if (props.variant === "placeholder") {
    const { variant, icon, tagColor, ...divProps } = props;
    void variant;
    const backgroundClass = tagColor
      ? TAG_BG_CLASS[tagColor]
      : "bg-background-secondary";

    return (
      <div
        {...divProps}
        className={cx(baseClass, "items-center justify-center", backgroundClass, className)}
      >
        {icon ? (
          <span className={tagColor ? TAG_ICON_CLASS[tagColor] : "text-text-secondary"}>{icon}</span>
        ) : null}
      </div>
    );
  }

  if (props.variant === "textSnippet") {
    const {
      variant,
      text,
      lines,
      tagColor,
      ...divProps
    } = props;
    void variant;
    void lines;
    // Note: in product, `textSnippet` thumbnails are specifically used for Genie-style
    // question prompts (paired with the Genie/sparkle icon in the card title). We keep the
    // variant generic here for composability.
    const backgroundClass = tagColor
      ? TAG_BG_CLASS[tagColor]
      : "bg-background-secondary";
    const textClass = tagColor
      ? TAG_TEXT_CLASS[tagColor]
      : "text-text-secondary";

    return (
      <div
        {...divProps}
        className={cx(
          baseClass,
          // Match Figma: centered stack with 16px padding.
          "flex-col items-center gap-sm px-md pt-md",
          backgroundClass,
          className,
        )}
      >
        <p
          className={cx(
            "w-[min-content] min-w-full whitespace-pre-wrap font-semibold leading-5",
            "text-[16px]",
            textClass,
            // Keep snippet text subdued without changing semantic colors directly.
            "opacity-70",
          )}
          // Use a mask fade on the text itself (not an overlay) so the fade always
          // matches the background, even when the background is semi-transparent (Tag colors).
          style={{
            WebkitMaskImage:
              // Important: pin the mask to the thumbnail height (104px) so the fade is
              // relative to the *container*, not the text height. This keeps the fade visible
              // even when text overflows past the thumbnail bounds.
              // 104px tall thumbnail:
              // Make the fade more visible:
              // - keep fully opaque through ~56px
              // - then a longer fade ramp to 0 at the bottom
              "linear-gradient(to bottom, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 56px, rgba(0,0,0,0.35) 84px, rgba(0,0,0,0) 104px)",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "100% 104px",
            // Parent has `pt-md` (16px). Shift mask up so 0px aligns with thumbnail top.
            WebkitMaskPosition: "0 -16px",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 56px, rgba(0,0,0,0.35) 84px, rgba(0,0,0,0) 104px)",
            maskRepeat: "no-repeat",
            maskSize: "100% 104px",
            maskPosition: "0 -16px",
          }}
        >
          {text}
        </p>
      </div>
    );
  }

  if (props.variant === "image") {
    if ("dashboardIndex" in props) {
      const {
        variant,
        dashboardIndex,
        alt,
        sizes,
        quality,
        ...divProps
      } = props;
      void variant;
      const pair = getDashboardThumbnailSrcPair(dashboardIndex);
      const safeAlt = alt ?? "";
      const safeSizes = sizes ?? "(max-width: 640px) 100vw, 320px";
      const safeQuality = quality ?? 90;

      return (
        <div {...divProps} className={cx(baseClass, "bg-background-secondary", className)}>
          <Image
            alt={safeAlt}
            src={pair.light}
            fill
            sizes={safeSizes}
            quality={safeQuality}
            className="pointer-events-none block object-cover dark:hidden"
          />
          <Image
            alt={safeAlt}
            src={pair.dark}
            fill
            sizes={safeSizes}
            quality={safeQuality}
            className="pointer-events-none hidden object-cover dark:block"
          />
        </div>
      );
    }

    const { variant, src, alt, sizes, quality, ...divProps } = props;
    void variant;
    const safeAlt = alt ?? "";
    const safeSizes = sizes ?? "(max-width: 640px) 100vw, 320px";
    const safeQuality = quality ?? 90;

    return (
      <div {...divProps} className={cx(baseClass, "bg-background-secondary", className)}>
        <Image
          alt={safeAlt}
          src={src.light}
          fill
          sizes={safeSizes}
          quality={safeQuality}
          className="pointer-events-none block object-cover dark:hidden"
        />
        <Image
          alt={safeAlt}
          src={src.dark}
          fill
          sizes={safeSizes}
          quality={safeQuality}
          className="pointer-events-none hidden object-cover dark:block"
        />
      </div>
    );
  }

  // code
  const { variant, code, language, highlightedTokens, maxLines: maybeMaxLines, ...divProps } =
    props;
  void variant;
  const maxLines = maybeMaxLines ?? 5;
  const truncated = truncateLines(code, maxLines);

  return (
    <div
      {...divProps}
      className={cx(baseClass, "items-center justify-center bg-background-secondary", className)}
    >
      <CodeBlock
        // Override: code thumbnails should not show a CodeBlock border.
        className="h-full w-full rounded-sm border-0"
        code={truncated}
        showMenu={false}
        actionsPlacement="none"
        showLineNumbers={false}
        // No scrolling in thumbnails; clip overflow (preserve whitespace).
        wrap={false}
        allowHorizontalScroll={false}
        maxVisibleLines={null}
        highlightedTokens={highlightedTokens}
        language={language}
      />
    </div>
  );
}

