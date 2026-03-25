"use client";

import * as React from "react";
import Link from "next/link";

import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type SectionTitleProps = {
  className?: string;
  /** Section title label (text). */
  children: React.ReactNode;
  /**
   * When provided, renders the title as a link and shows a chevron-right.
   * Matches the linked-title variant in Figma.
   */
  href?: string;
  /**
   * Selection state (used by Section tabs).
   * When selected, the background pill is shown at rest.
   */
  selected?: boolean;
  /** Click handler (used by Section tabs). Ignored when `href` is provided. */
  onClick?: () => void;
  /**
   * Extra props forwarded to the underlying button when `onClick` is provided.
   * Used by Section tabs for ARIA roles/attributes and keyboard interactions.
   */
  buttonProps?: Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "children" | "className" | "onClick"
  >;
  /** Ref forwarded to the underlying button when `onClick` is provided. */
  buttonRef?: React.Ref<HTMLButtonElement>;
};

export function SectionTitle({
  className,
  children,
  href,
  selected = false,
  onClick,
  buttonProps,
  buttonRef,
}: SectionTitleProps) {
  const interactive = Boolean(href) || Boolean(onClick);
  const commonClassName = cx(
    interactive && "group cursor-pointer",
    "relative inline-flex items-center gap-[2px]",
    className,
  );

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute -inset-y-px -inset-x-mid rounded-full bg-background-secondary",
          selected
            ? "opacity-100"
            : interactive
              ? "opacity-0 group-hover:opacity-100 group-active:opacity-100"
              : "opacity-0",
        )}
      />
      <span className="relative inline-flex items-center gap-[2px]">
        <span className="text-[16px] font-medium leading-6 text-text-primary">
          {children}
        </span>
        {href ? (
          <Icon name="chevronRightIcon" size={16} className="text-text-primary" />
        ) : null}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={commonClassName}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        {...buttonProps}
        ref={buttonRef}
        type="button"
        className={commonClassName}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <div className={commonClassName}>{content}</div>;
}

