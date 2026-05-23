"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center data-[disabled]:opacity-40",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
      <SliderPrimitive.Range className="absolute h-full bg-amber-400" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block size-4 rounded-full border-2 border-amber-400 bg-[#0c1a33] shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 disabled:pointer-events-none disabled:opacity-50"
      aria-label="Ajustar quantidade"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

export { Slider };