"use client";

import * as React from "react";
import {
  useFloating,
  useHover,
  useFocus,
  useRole,
  useDismiss,
  useInteractions,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
  FloatingArrow,
  FloatingPortal,
  type Placement,
} from "@floating-ui/react";

export type TooltipProps = {
  content: React.ReactNode;
  side?: Placement;
  children: React.ReactElement;
};

const ARROW_HEIGHT = 4;
const ARROW_WIDTH = 8;
const GAP = 2;

export function Tooltip({ content, side = "top", children }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const arrowRef = React.useRef<SVGSVGElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: side,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(ARROW_HEIGHT + GAP),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, { move: false, delay: { open: 400, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-flex"
      >
        {children}
      </span>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 max-w-[200px] rounded-sm bg-[#161616] px-2 py-1 text-[13px] leading-5 text-white shadow-[0_3px_6px_rgba(0,0,0,0.05)]"
          >
            {content}
            <FloatingArrow
              ref={arrowRef}
              context={context}
              fill="#161616"
              width={ARROW_WIDTH}
              height={ARROW_HEIGHT}
            />
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
