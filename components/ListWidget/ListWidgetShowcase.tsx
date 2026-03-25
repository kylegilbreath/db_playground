"use client";

import * as React from "react";

import { ListItem } from "./ListItem";
import { ListWidget } from "./ListWidget";

export function ListWidgetShowcase() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <p className="text-paragraph text-text-secondary">Icon variant</p>
        <ListWidget className="max-w-sm" footerLabel="See more">
          <ListItem
            iconName="dashboardIcon"
            label="dashboard.name"
            metadata={["10m ago", "Dashboard"]}
          />
          <ListItem
            iconName="AppsAssetIcon"
            label="app.name"
            metadata={["10m ago", "Dashboard"]}
          />
          <ListItem
            iconName="dashboardIcon"
            label="dashboard.name"
            metadata={["10m ago", "Dashboard"]}
          />
          <ListItem
            iconName="SparkleRectangleIcon"
            label="genie.space.name"
            metadata={["10m ago", "Dashboard"]}
          />
          <ListItem
            iconName="AppsAssetIcon"
            label="app.name"
            metadata={["10m ago", "Dashboard"]}
          />
        </ListWidget>
      </div>

      <div className="flex flex-col gap-sm">
        <p className="text-paragraph text-text-secondary">No-icon variant</p>
        <ListWidget className="max-w-sm">
          <ListItem
            label="dashboard.name"
            metadata={["10m ago", "Dashboard"]}
          />
          <ListItem
            label="query.name"
            metadata={["2h ago", "Query"]}
          />
          <ListItem
            label="notebook.name"
            metadata={["1d ago", "Notebook"]}
          />
        </ListWidget>
      </div>

      <div className="flex flex-col gap-sm">
        <p className="text-paragraph text-text-secondary">
          Thumbnail variant
        </p>
        <ListWidget className="max-w-sm" footerLabel="See more">
          <ListItem
            thumbnail={{
              kind: "placeholder",
              iconName: "dashboardIcon",
            }}
            label="dashboard.name"
            metadata={["10m ago", "Dashboard"]}
          />
          <ListItem
            thumbnail={{
              kind: "placeholder",
              iconName: "dashboardIcon",
            }}
            label="dashboard.name"
            metadata={["3h ago", "Dashboard"]}
          />
        </ListWidget>
      </div>

      <div className="flex flex-col gap-sm">
        <p className="text-paragraph text-text-secondary">
          With decorators
        </p>
        <ListWidget className="max-w-sm">
          <ListItem
            iconName="dashboardIcon"
            label="dashboard.name"
            decorators={[{ kind: "certified" }, { kind: "favorited" }]}
            metadata={["10m ago", "Dashboard"]}
          />
          <ListItem
            iconName="tableIcon"
            label="table.name.with.a.very.long.label.that.should.truncate"
            decorators={[{ kind: "trending" }]}
            metadata={["2h ago", "Table"]}
          />
        </ListWidget>
      </div>
    </div>
  );
}
