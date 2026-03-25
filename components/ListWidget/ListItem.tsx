"use client";

import * as React from "react";
import Image from "next/image";

import { Icon } from "@/components/icons";
import { NameLabel, type NameLabelDecorator } from "@/components/NameLabel";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

type ThumbnailImage = {
  kind: "image";
  src: string | { light: string; dark: string };
  alt?: string;
};

type ThumbnailPlaceholder = {
  kind: "placeholder";
  iconName: string;
};

export type ListItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onClick"
> & {
  iconName?: string;
  thumbnail?: ThumbnailImage | ThumbnailPlaceholder;
  label: string;
  decorators?: NameLabelDecorator[];
  metadata?: string[];
  onClick?: () => void;
};

export function ListItem({
  iconName,
  thumbnail,
  label,
  decorators,
  metadata,
  onClick,
  className,
  ...rest
}: ListItemProps) {
  const hasThumbnail = Boolean(thumbnail);
  const hasIcon = Boolean(iconName) && !hasThumbnail;

  return (
    <div
      {...rest}
      className={cx(
        "flex w-full items-start rounded-md p-sm",
        "transition-colors duration-100 ease-in-out",
        "hover:bg-background-secondary",
        onClick && "cursor-pointer",
        (hasThumbnail) && "gap-sm",
        className,
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {thumbnail?.kind === "image" ? (
        <div className="relative h-auto w-20 shrink-0 self-stretch overflow-hidden rounded-sm bg-background-secondary">
          {typeof thumbnail.src === "string" ? (
            <Image
              src={thumbnail.src}
              alt={thumbnail.alt ?? label}
              fill
              className="object-cover"
            />
          ) : (
            <>
              <Image
                src={thumbnail.src.light}
                alt={thumbnail.alt ?? label}
                fill
                className="object-cover dark:hidden"
              />
              <Image
                src={thumbnail.src.dark}
                alt={thumbnail.alt ?? label}
                fill
                className="hidden object-cover dark:block"
              />
            </>
          )}
        </div>
      ) : thumbnail?.kind === "placeholder" ? (
        <div className="flex w-20 shrink-0 items-center justify-center self-stretch rounded-sm bg-background-tertiary p-sm">
          <Icon
            name={thumbnail.iconName}
            size={16}
            className="text-text-secondary"
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        <NameLabel
          leadingIcon={
            hasIcon ? <Icon name={iconName!} size={16} /> : undefined
          }
          label={label}
          decorators={decorators}
        />

        {metadata && metadata.length > 0 ? (
          <div className="flex flex-wrap items-center gap-xs text-hint text-text-secondary">
            {metadata.map((segment, i) => (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <span aria-hidden="true" className="text-text-secondary">
                    ·
                  </span>
                ) : null}
                <span className="truncate">{segment}</span>
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
