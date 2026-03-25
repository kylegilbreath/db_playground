"use client";

import * as React from "react";

import {
  TabsAdd,
  TabsCollection,
  TabsContent,
  TabsItem,
  TabsList,
  type TabsType,
} from "./Tabs";

import { Icon } from "@/components/icons";

type DemoTab = { value: string; label: string; closable?: boolean };

function nextTabValue(existing: Set<string>) {
  for (let i = 1; i < 1000; i += 1) {
    const v = `tab-${i}`;
    if (!existing.has(v)) return v;
  }
  return `tab-${crypto.randomUUID()}`;
}

function TabsDemo({ type }: { type: TabsType }) {
  const [tabs, setTabs] = React.useState<DemoTab[]>(() => {
    if (type === "lined") {
      return [
        { value: "tab-1", label: "Overview" },
        { value: "tab-2", label: "Details" },
        { value: "tab-3", label: "History", closable: true },
      ];
    }

    return [
      { value: "tab-1", label: "Overview", closable: true },
      { value: "tab-2", label: "Details", closable: true },
      { value: "tab-3", label: "History", closable: true },
    ];
  });

  const [value, setValue] = React.useState<string>(tabs[0]?.value ?? "tab-1");

  React.useEffect(() => {
    if (tabs.some((t) => t.value === value)) return;
    setValue(tabs[0]?.value ?? "tab-1");
  }, [tabs, value]);

  const close = React.useCallback(
    (v: string) => {
      setTabs((prev) => prev.filter((t) => t.value !== v));
    },
    [setTabs],
  );

  const add = React.useCallback(() => {
    setTabs((prev) => {
      const existing = new Set(prev.map((t) => t.value));
      const v = nextTabValue(existing);
      return [...prev, { value: v, label: `Tab ${prev.length + 1}`, closable: true }];
    });
  }, []);

  return (
    <TabsCollection defaultValue={value} onValueChange={setValue} type={type} value={value}>
      <TabsList aria-label={`${type} tabs`}>
        {tabs.map((t) => (
          <TabsItem
            key={t.value}
            closable={Boolean(t.closable)}
            leadingIcon={
              type === "contained" ? <Icon name="queryListView" size={16} /> : undefined
            }
            onClose={t.closable ? () => close(t.value) : undefined}
            value={t.value}
          >
            {t.label}
          </TabsItem>
        ))}
        <TabsAdd aria-label="Add tab" onClick={add} />
      </TabsList>

      <div className="mt-md rounded-md border border-border bg-background-secondary p-md">
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <p className="text-paragraph text-text-secondary">
              Content for <span className="text-text-primary">{t.label}</span>
            </p>
          </TabsContent>
        ))}
      </div>
    </TabsCollection>
  );
}

export function TabsShowcase() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <h3 className="text-title4 font-semibold tracking-tight">Lined</h3>
        <TabsDemo type="lined" />
      </div>
      <div className="flex flex-col gap-sm">
        <h3 className="text-title4 font-semibold tracking-tight">Contained (“soft tabs”)</h3>
        <TabsDemo type="contained" />
      </div>
    </div>
  );
}

