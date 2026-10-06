import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "flex h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-900 transition-colors duration-150 outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 aria-invalid:border-red-600 aria-invalid:focus:border-red-600 aria-invalid:focus:ring-red-600",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
