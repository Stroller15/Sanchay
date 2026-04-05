import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-green-500 text-white hover:opacity-90",
  destructive: "bg-[--color-danger] text-white hover:opacity-90",
  outline:
    "border border-[--color-border] bg-transparent text-[--color-text-secondary] hover:bg-[--color-bg]",
  ghost:
    "bg-transparent text-[--color-text-secondary] hover:bg-[--color-bg] hover:text-[--color-text-primary]",
  link: "text-[--color-text-primary] underline-offset-4 hover:underline",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 py-2 rounded-lg",
  sm: "h-8 px-3 rounded-lg",
  lg: "h-11 px-8 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
