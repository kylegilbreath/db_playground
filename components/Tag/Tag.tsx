"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type TagColor =
  | "Default"
  | "Charcoal"
  | "Lemon"
  | "Lime"
  | "Teal"
  | "Turquoise"
  | "Indigo"
  | "Purple"
  | "Pink"
  | "Coral"
  | "Brown";

const BG_CLASS: Record<TagColor, string> = {
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

const TEXT_CLASS: Record<TagColor, string> = {
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

const ICON_CLASS: Record<TagColor, string> = {
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

export type TagLeftElement =
  | { type: "Icon"; icon: React.ReactNode }
  | { type: "Image"; src: string; alt?: string };

export type TagProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Matches Figma `Tag/Color`. */
  color?: TagColor;
  /** Matches Figma `Tag/Left element`. */
  leftElement?: TagLeftElement;
  /** Matches Figma `Tag/Interactive?`. */
  interactive?: boolean;
  /** Matches Figma `Tag/Closable?`. */
  closable?: boolean;
  /** Called when the close button is pressed (only relevant when `closable`). */
  onClose?: () => void;
  children: React.ReactNode;
};

export function Tag({
  color = "Default",
  leftElement,
  interactive = false,
  closable = false,
  onClose,
  children,
  className,
  onClick,
  onKeyDown,
  ...rest
}: TagProps) {
  const bgClass = BG_CLASS[color];
  const textClass = TEXT_CLASS[color];
  const iconClass = ICON_CLASS[color];

  const isButtonLike = interactive && Boolean(onClick);

  return (
    <div
      {...rest}
      className={cx(
        "relative inline-flex h-5 items-center gap-0 overflow-hidden rounded-sm",
        bgClass,
        // Interaction surface (for the tag itself)
        isButtonLike && "group cursor-pointer select-none outline-none",
        // Overlay hover/press tint (keeps the base color visible).
        isButtonLike &&
          "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:opacity-0 hover:before:bg-tag-hover hover:before:opacity-100 active:before:bg-tag-press active:before:opacity-100",
        // Focus ring (matches other primitives)
        isButtonLike &&
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        className,
      )}
      role={isButtonLike ? "button" : undefined}
      tabIndex={isButtonLike ? (rest.tabIndex ?? 0) : rest.tabIndex}
      onClick={(e) => {
        onClick?.(e);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!isButtonLike) return;
        if (e.defaultPrevented) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Mimic click for button-like behavior.
          (e.currentTarget as HTMLDivElement).click();
        }
      }}
    >
      <span
        className={cx(
          "relative z-10 inline-flex items-center",
          leftElement
            ? closable ? "gap-xs pl-xs pr-[2px]" : "gap-xs px-xs"
            : "gap-0 px-xs",
        )}
      >
        {leftElement?.type === "Icon" ? (
          <span
            className={cx(
              "inline-flex size-4 items-center justify-center",
              iconClass,
              isButtonLike && "group-hover:text-tag-icon-hover group-active:text-tag-icon-press",
            )}
            aria-hidden="true"
          >
            {leftElement.icon}
          </span>
        ) : leftElement?.type === "Image" ? (
          // Logos are provided by product/consumers; `<img>` is appropriate here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={leftElement.alt ?? ""}
            className="block size-4 object-contain"
            src={leftElement.src}
          />
        ) : null}

        <span className={cx("whitespace-nowrap text-paragraph leading-5", textClass)}>
          {children}
        </span>
      </span>

      {closable ? (
        <button
          aria-label={typeof children === "string" ? `Remove ${children}` : "Remove tag"}
          className={cx(
            "relative z-10 inline-flex items-center justify-center rounded-br-sm rounded-tr-sm",
            // Figma close button: action icon background tokens.
            "bg-action-icon-background-default hover:bg-action-icon-background-hover active:bg-action-icon-background-press",
            // Size: icon (16) + padding (2) = 20px tall.
            "p-[2px]",
            // Icon color uses Tag icon palette.
            iconClass,
            // Important: close icon should remain color-mapped to the tag (only background changes).
            // Focus visible
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
          type="button"
        >
          <Icon name="closeSmallIcon" size={16} />
        </button>
      ) : null}
    </div>
  );
}

