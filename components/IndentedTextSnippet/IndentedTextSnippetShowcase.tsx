import * as React from "react";

import { IndentedTextSnippet, IndentedTextSnippetHighlight } from "./IndentedTextSnippet";

export function IndentedTextSnippetShowcase() {
  return (
    <div className="flex max-w-[520px] flex-col gap-sm rounded-md border border-border bg-background-primary p-sm">
      <IndentedTextSnippet>
        Country{"\n"}
        <IndentedTextSnippetHighlight>Country_Id</IndentedTextSnippetHighlight>
      </IndentedTextSnippet>

      <IndentedTextSnippet>
        Matching column:{" "}
        <IndentedTextSnippetHighlight>Owner</IndentedTextSnippetHighlight>
        {"\n"}Shared with you
      </IndentedTextSnippet>
    </div>
  );
}

