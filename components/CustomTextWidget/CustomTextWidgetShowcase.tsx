"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

import { CustomTextWidget } from "./CustomTextWidget";

function ExampleContent({ compactTitle = false }: { compactTitle?: boolean }) {
  return (
    <div className="min-w-0 text-paragraph leading-5 text-text-primary">
      <div
        className={
          compactTitle
            ? "text-paragraph font-semibold leading-5 text-text-primary"
            : "text-title3 font-semibold leading-6 text-text-primary"
        }
      >
        Welcome to the Northstar Data Workspace
      </div>
      <p className="mt-1 text-paragraph leading-5 text-text-primary">
        This is the shared home for analytics, reporting, and ML work across the company.
      </p>
      <div className="mt-md font-semibold">Get started</div>
      <ul className="mt-xs list-disc pl-5 text-paragraph leading-5">
        <li>
          <a
            className="text-action-tertiary-text-default no-underline hover:text-action-tertiary-text-hover hover:underline active:text-action-tertiary-text-press"
            href="#"
          >
            Browse all domains
          </a>
        </li>
        <li>
          <a
            className="text-action-tertiary-text-default no-underline hover:text-action-tertiary-text-hover hover:underline active:text-action-tertiary-text-press"
            href="#"
          >
            Certified data
          </a>
        </li>
        <li>
          <a
            className="text-action-tertiary-text-default no-underline hover:text-action-tertiary-text-hover hover:underline active:text-action-tertiary-text-press"
            href="#"
          >
            New user onboarding guide
          </a>
        </li>
      </ul>
      <div className="mt-md font-semibold">What’s important</div>
      <ul className="mt-xs list-disc pl-5 text-paragraph leading-5">
        <li>Domains contain the most trusted, business-ready data</li>
        <li>Certified assets should be used for reporting and production work</li>
        <li>Legacy assets may be deprecated over time</li>
      </ul>
      <div className="mt-md font-semibold">Need help?</div>
      <ul className="mt-xs list-disc pl-5 text-paragraph leading-5">
        <li>
          <a
            className="text-action-tertiary-text-default no-underline hover:text-action-tertiary-text-hover hover:underline active:text-action-tertiary-text-press"
            href="#"
          >
            #northstar-data-help
          </a>{" "}
          on Slack
        </li>
        <li>Office hours: Thursdays 2–3pm</li>
        <li>Platform owners: @data-platform</li>
      </ul>
      <div className="mt-md font-semibold">Standards</div>
      <ul className="mt-xs list-disc pl-5 text-paragraph leading-5">
        <li>All new assets should include an owner and description</li>
        <li>Use domain conventions for naming and organization</li>
        <li>Prefer certified sources whenever available</li>
      </ul>
    </div>
  );
}

export function CustomTextWidgetShowcase() {
  return (
    <div className="flex w-full flex-col gap-lg">
      <CustomTextWidget
        actions={[
          {
            id: "hide",
            ariaLabel: "Hide widget",
            iconName: "visibleOffIcon",
            onClick: () => {},
          },
        ]}
      >
        <ExampleContent />
      </CustomTextWidget>

      <CustomTextWidget
        defaultExpanded
        actions={[
          {
            id: "edit",
            ariaLabel: "Edit widget",
            iconName: "pencilIcon",
            onClick: () => {},
          },
        ]}
      >
        <ExampleContent />
      </CustomTextWidget>

      <CustomTextWidget
        mode="preview"
        actions={[
          {
            id: "hide",
            ariaLabel: "Hide widget",
            iconName: "visibleOffIcon",
            onClick: () => {},
          },
        ]}
        onSeeMore={() => {}}
      >
        <ExampleContent compactTitle />
      </CustomTextWidget>

      <div className="text-hint leading-4 text-text-secondary">
        Icons used in this showcase:
        <span className="ml-xs inline-flex items-center gap-xs">
          <Icon name="visibleOffIcon" size={16} className="text-text-secondary" />
          <Icon name="pencilIcon" size={16} className="text-text-secondary" />
        </span>
      </div>
    </div>
  );
}

