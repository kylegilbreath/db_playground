"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

import { MetadataItem, MetadataRow } from "./Metadata";

export function MetadataShowcase() {
  return (
    <div className="flex flex-col gap-sm">
      <div className="rounded-md border border-border bg-background-primary p-sm">
        <MetadataRow>
          <MetadataItem separator>catalog.schema</MetadataItem>
          <MetadataItem separator>Modified 1d ago</MetadataItem>
          <MetadataItem separator={false}>Joseph Christen</MetadataItem>
        </MetadataRow>
      </div>

      <div className="rounded-md border border-border bg-background-primary p-sm">
        <MetadataRow>
          <MetadataItem icon={<Icon name="historyIcon" size={14} />}>
            Updated 1d ago
          </MetadataItem>
          <MetadataItem icon={<Icon name="visibleIcon" size={14} />}>
            Viewed 15 days ago
          </MetadataItem>
          <MetadataItem icon={<Icon name="userOutlineIcon" size={14} />} separator={false}>
            Joseph Christen
          </MetadataItem>
        </MetadataRow>
      </div>

      <div className="rounded-md border border-border bg-background-primary p-sm">
        <MetadataRow>
          <MetadataItem
            icon={<Icon name="historyIcon" size={14} />}
            tooltip="Sort by updated time"
            onClick={() => {
              // demo only
            }}
          >
            Updated 1d ago
          </MetadataItem>
          <MetadataItem icon={<Icon name="visibleIcon" size={14} />}>
            Viewed 15 days ago
          </MetadataItem>
          <MetadataItem separator={false}>
            A very long owner name that should wrap with the row and truncate within the item
          </MetadataItem>
        </MetadataRow>
      </div>
    </div>
  );
}

