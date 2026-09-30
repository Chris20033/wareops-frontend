import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-900 transition-colors duration-150 outline-none placeholder:text-neutral-500 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 aria-invalid:border-red-600 aria-invalid:focus:border-red-600 aria-invalid:focus:ring-red-600",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
