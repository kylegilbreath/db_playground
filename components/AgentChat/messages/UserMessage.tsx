import * as React from "react";
import type { UserMessage as UserMessageType } from "../types";

export function UserMessage({ step }: { step: UserMessageType }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl bg-action-default-background-press px-3 py-2 text-paragraph leading-5 text-action-default-text">
        {step.text}
      </div>
    </div>
  );
}
