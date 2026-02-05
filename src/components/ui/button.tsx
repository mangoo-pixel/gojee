"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 transition-colors",
  {
    variants: {
      variant: {
        primary:
          "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900",
        outline:
          "border border-neutral-900 text-neutral-900 bg-white hover:bg-neutral-100 active:bg-neutral-200",
        ghost:
          "bg-transparent text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200",
      },
      size: {
        lg: "h-[60px] px-6 text-[18px]",
        md: "h-12 px-5 text-[16px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

