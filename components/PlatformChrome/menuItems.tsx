"use client";

import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { DropdownMenuItem } from "@/components/DropdownMenu";
import { Icon } from "@/components/icons";

/* eslint-disable @next/next/no-img-element */

export function getAppSwitcherItems(router: AppRouterInstance): DropdownMenuItem[] {
  return [
    {
      id: "lakehouse",
      label: "Lakehouse",
      description: "Analytics & AI on large-scale data",
      onSelect: () => router.push("/"),
      leadingIcon: (
        <img alt="" src="/logos/Lakehouse.svg" className="block size-8 object-contain" />
      ),
    },
    {
      id: "databricks_one_topbar",
      label: "Databricks One (Top bar)",
      description: "One variant with top bar and chat nav",
      onSelect: () => router.push("/databricks-one-chat-nav-with-top-bar"),
      leadingIcon: (
        <img alt="" src="/logos/DatabricksOne.svg" className="block size-8 object-contain" />
      ),
    },
    {
      id: "databricks_one_no_topbar",
      label: "Databricks One (M1)",
      description: "Side bar nav, no top bar",
      onSelect: () => router.push("/databricks-one-chat-nav-no-top-bar"),
      leadingIcon: (
        <img alt="" src="/logos/DatabricksOne.svg" className="block size-8 object-contain" />
      ),
    },
    {
      id: "databricks_one_m2",
      label: "Databricks One (M2)",
      description: "M1 + custom text widget",
      onSelect: () => router.push("/databricks-one-m2"),
      leadingIcon: (
        <img alt="" src="/logos/DatabricksOne.svg" className="block size-8 object-contain" />
      ),
    },
    {
      id: "lakebase",
      label: "Lakebase Postgres",
      description: "Operational databases for applications",
      leadingIcon: (
        <img alt="" src="/logos/Lakebase.svg" className="block size-8 object-contain" />
      ),
    },
    {
      id: "component_gallery",
      label: "Component gallery",
      description: "Sticker sheet and component reference",
      onSelect: () => router.push("/components"),
      leadingIcon: <Icon name="AppsIcon" size={24} className="text-text-secondary" />,
    },
    {
      id: "asset_matrix",
      label: "Asset visual matrix",
      description: "Asset types across view modes and themes",
      onSelect: () => router.push("/databricks-one-chat-nav-no-top-bar/asset-matrix"),
      leadingIcon: <Icon name="gridIcon" size={24} className="text-text-secondary" />,
    },
  ];
}

export function getWorkspaceSelectorItems(): DropdownMenuItem[] {
  return [
    { id: "production", label: "Production" },
    { id: "staging", label: "Staging" },
  ];
}

export function getAvatarMenuItems(
  theme: "light" | "dark",
  toggleTheme: () => void,
): DropdownMenuItem[] {
  return [
    { id: "settings", label: "Settings" },
    { id: "privacy", label: "Privacy policy" },
    { id: "support", label: "Contact Support" },
    { id: "previews", label: "Previews", separatorAbove: true },
    { id: "feedback", label: "Send feedback" },
    {
      id: "theme",
      label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      leadingIcon: theme === "dark" ? <Sun size={16} weight="regular" /> : <Moon size={16} weight="regular" />,
      onSelect: toggleTheme,
      separatorAbove: true,
    },
    { id: "logout", label: "Log out", separatorAbove: true },
  ];
}
