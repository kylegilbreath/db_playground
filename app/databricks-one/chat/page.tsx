"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { AnythingBox } from "@/components/AnythingBox/AnythingBox";
import { IconButton } from "@/components/IconButton";
import { Tag } from "@/components/Tag/Tag";
import { Icon } from "@/components/icons";

const DEMO_THREAD_TITLE = "How does the total sales amount compare to last year?";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const promptParam = (searchParams.get("prompt") ?? "").trim();

  const [composerText, setComposerText] = React.useState<string>(promptParam);

  React.useEffect(() => {
    setComposerText(promptParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptParam]);

  return (
    <main className="relative flex h-full min-h-0 w-full p-0">
      <div className="flex h-full min-h-0 w-full overflow-hidden rounded-md">
        {/* Conversation */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div className="flex items-center gap-sm border-b border-border px-4 py-3">
            <div className="min-w-0 flex-1 truncate text-paragraph font-medium leading-5 text-text-primary">
              {DEMO_THREAD_TITLE}
            </div>
            <IconButton
              aria-label="More"
              icon={<Icon name="overflowIcon" size={16} />}
              size="small"
              tone="neutral"
            />
          </div>

          {/* Messages + Composer */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6">
            <div className="mx-auto flex w-full max-w-[790px] flex-1 flex-col">
              <div className="flex-1 py-6">
                {/* User bubble */}
                <div className="flex w-full justify-end">
                  <div className="max-w-[720px] rounded-full bg-background-secondary px-4 py-2 text-paragraph leading-5 text-text-primary">
                    {promptParam || DEMO_THREAD_TITLE}
                  </div>
                </div>

                {/* Assistant response */}
                <div className="mt-6 flex w-full gap-sm">
                  <div className="pt-[2px]">
                    <span className="inline-flex size-5 items-center justify-center" aria-hidden="true">
                      <Icon name="SparkleIcon" size={16} className="text-text-secondary" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-hint leading-4 text-text-secondary">Sales Pipeline Q&amp;A</div>

                    <div className="mt-xs text-paragraph leading-5 text-text-primary">
                      <p className="font-medium">
                        Total sales this year are <span className="font-semibold">$48.2M</span>, compared to{" "}
                        <span className="font-semibold">$42.5M</span> last year — a{" "}
                        <span className="font-semibold">13% increase year-over-year</span>.
                      </p>
                      <ul className="mt-sm list-disc pl-5">
                        <li>
                          <span className="font-medium">Enterprise accounts</span>: +18% YoY (driven by renewals and upsells)
                        </li>
                        <li>
                          <span className="font-medium">Mid-market</span>: +1% YoY (stable growth)
                        </li>
                        <li>
                          <span className="font-medium">Small business</span>: −7% YoY (churn in North America)
                        </li>
                      </ul>
                      <p className="mt-sm text-text-secondary">
                        Would you like me to drill into region or product line next?
                      </p>
                    </div>

                    <div className="mt-sm flex flex-wrap gap-sm">
                      <Tag>transactions</Tag>
                      <Tag>forecast_actuals</Tag>
                      <Tag>accounts_master</Tag>
                    </div>

                    <div className="mt-sm flex items-center gap-xs">
                      <IconButton aria-label="Copy" icon={<Icon name="copyIcon" size={16} />} size="small" />
                      <IconButton aria-label="Thumbs up" icon={<Icon name="ThumbsUpIcon" size={16} />} size="small" />
                      <IconButton aria-label="Thumbs down" icon={<Icon name="ThumbsDownIcon" size={16} />} size="small" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Composer */}
              <div className="sticky bottom-0 py-6">
                <AnythingBox
                  phase="chat"
                  value={composerText}
                  onValueChange={setComposerText}
                  onSubmit={() => {}}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
