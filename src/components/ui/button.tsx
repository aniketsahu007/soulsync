import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex transform-gpu items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[15px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-alert text-alert-foreground hover:bg-alert/90",
        outline:
          "border border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-primary/10 text-primary hover:bg-primary/20",
        ghost: 
          "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        // Mapping old custom variants to standard ones to prevent immediate crashes, will remove usages next
        hero: "bg-primary text-primary-foreground hover:bg-primary/90",
        heroOutline: "border border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        mood: "bg-primary/10 text-primary hover:bg-primary/20",
      },
      size: {
        default: "px-[22px] py-[12px]",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

