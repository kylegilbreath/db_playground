"use client";

import * as React from "react";

import { TertiaryButton } from "@/components/TertiaryButton";
import { Icon } from "@/components/icons";

import { Section } from "./Section";

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] w-full items-center justify-center rounded-md border border-border border-dashed bg-background-primary">
      <span className="font-mono text-paragraph text-text-secondary">{label}</span>
    </div>
  );
}

export function SectionShowcase() {
  return (
    <div className="flex w-full flex-col gap-lg">
      <Section
        title="Section title"
        description="This is a brief description of the section"
      >
        <Placeholder label="Content" />
      </Section>

      <Section title="Section title" titleHref="/components">
        <Placeholder label="Content" />
      </Section>

      <Section
        title="Section title"
        headerRight={
          <>
            <TertiaryButton size="small" menu tone="neutral">
              Relevance
            </TertiaryButton>
            <TertiaryButton
              size="small"
              menu
              tone="neutral"
              leadingIcon={<Icon name="listIcon" size={16} />}
            >
              List
            </TertiaryButton>
          </>
        }
      >
        <Placeholder label="Content" />
      </Section>

      <Section
        mode="tabs"
        tabs={[
          { id: "for-you", label: "For you", content: <Placeholder label="For you" /> },
          { id: "recents", label: "Recents", content: <Placeholder label="Recents" /> },
          { id: "favorites", label: "Favorites", content: <Placeholder label="Favorites" /> },
          { id: "shared", label: "Shared", content: <Placeholder label="Shared" /> },
        ]}
      />
    </div>
  );
}

