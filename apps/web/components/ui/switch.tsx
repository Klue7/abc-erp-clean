import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = (props: React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>) => {
  const { className, ...rest } = props;
  return (
    <SwitchPrimitives.Root
      {...rest}
      className={cn(
        "inline-flex h-6 w-10 items-center rounded-full bg-neutral-300 data-[state=checked]:bg-neutral-900",
        className
      )}
    >
      <SwitchPrimitives.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-4" />
    </SwitchPrimitives.Root>
  );
};
