import type * as React from "react";

import type { CardThumbnailProps } from "@/components/CardThumbnail";
import type { MetadataItemProps } from "@/components/Metadata";
import type { NameLabelDecorator } from "@/components/NameLabel";
import type { TagColor, TagLeftElement } from "@/components/Tag";
import type { PhIconProps } from "@/components/icons";

export type CardTitle = {
  leadingIcon: React.ReactNode;
  label: React.ReactNode;
  decorators?: NameLabelDecorator[];
};

export type CardTitleNoIcon = {
  label: React.ReactNode;
  decorators?: NameLabelDecorator[];
};

export type CardMetadataItem = {
  icon?: MetadataItemProps["icon"];
  label: React.ReactNode;
  separator?: boolean;
  tooltip?: string;
  onClick?: () => void;
};

export type CardTag = {
  label: React.ReactNode;
  color?: TagColor;
  leftElement?: TagLeftElement;
};

export type CardCodeSnippet = {
  code: string;
  language?: string;
  highlightedTokens?: string[];
};

export type CardBrandMark =
  | { kind: "logo"; src: string; alt?: string }
  | { kind: "phosphor"; icon: PhIconProps["icon"]; weight?: PhIconProps["weight"] };

/**
 * Narrower card subtype models (components-only approach).
 *
 * These types are meant to reduce ambiguity about which card to use, while
 * keeping the flexible `CardItem` for the existing `DetailCard` work.
 */
export type SmallCardItem = {
  id: string;
  title: CardTitle;
  subtitle?: React.ReactNode;
  metadataRow?: CardMetadataItem[];
  /** Optional tags row. */
  tags?: CardTag[];
};

export type ThumbnailCardItem = SmallCardItem & {
  /** Required top thumbnail. */
  thumbnail: CardThumbnailProps;
  /**
   * Optional second line in the metadata area (Figma shows a 2-line treatment on some variants).
   * Kept generic for composability.
   */
  description?: React.ReactNode;
};

export type SmallLogoCardItem = {
  id: string;
  /** Small (16px) partner mark: logo or Phosphor icon. */
  mark: CardBrandMark;
  title: CardTitleNoIcon;
  subtitle?: React.ReactNode;
  metadataRow?: CardMetadataItem[];
};

export type LargeLogoCardItem = {
  id: string;
  /** Large (40px) partner mark: logo or Phosphor icon. */
  mark: CardBrandMark;
  title: CardTitleNoIcon;
  subtitle?: React.ReactNode;
  metadataRow?: CardMetadataItem[];
  description?: React.ReactNode;
  tags?: CardTag[];
};

export type DetailLogoCardItem = {
  id: string;
  /** Large (40px) partner mark: logo or Phosphor icon. */
  mark: CardBrandMark;
  title: CardTitleNoIcon;
  subtitle?: React.ReactNode;
  metadataRow?: CardMetadataItem[];
  description?: React.ReactNode;
  tags?: CardTag[];
};

/**
 * CardItem
 *
 * TS-first "render model" used by the gallery/switcher.
 * Intentionally allows ReactNodes for speed; we can later refactor into a
 * serializable JSON/YAML model + adapter once the layouts stabilize.
 */
export type CardItem = {
  id: string;
  title: CardTitle;

  /** Optional logo shown above title (used in "logo card"). */
  logo?: { src: string; alt?: string };

  /** Optional secondary text line (used in simple cards). */
  subtitle?: React.ReactNode;

  /** Location/workspace row rendered above the main metadata row. */
  locationRow?: CardMetadataItem[];

  /** Inline metadata row (owner, updated, viewed, etc.). */
  metadataRow?: CardMetadataItem[];

  /** Optional longer description/wrapping text block. */
  description?: React.ReactNode;

  /** Optional tags row. */
  tags?: CardTag[];

  /** Optional indented snippet section (rendered via IndentedTextSnippet). */
  indentedSnippet?: React.ReactNode;

  /** Optional code snippet section (rendered via CodeBlock). */
  codeSnippet?: CardCodeSnippet;

  /** Optional thumbnail (rendered via CardThumbnail). */
  thumbnail?: CardThumbnailProps;
};
