import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-950 text-white hover:bg-neutral-850 active:bg-neutral-900 border border-neutral-950",
        outline:
          "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-200/80 border border-neutral-200/60",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 active:bg-neutral-150",
        destructive:
          "border border-red-300 bg-white text-red-700 hover:bg-red-50 active:bg-red-100",
        link: "text-neutral-950 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 gap-2 px-3.5",
        xs: "h-6 gap-1 rounded px-2 text-xs",
        sm: "h-8 gap-1.5 rounded px-2.5 text-xs",
        lg: "h-10 gap-2 px-4 text-sm",
        icon: "size-9",
        "icon-xs": "size-6 rounded",
        "icon-sm": "size-8 rounded",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
