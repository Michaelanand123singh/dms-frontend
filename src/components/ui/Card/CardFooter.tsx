"use client";
import { ReactNode } from "react";
import clsx from "clsx";

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
}

export function CardFooter({ children, className, border = true }: CardFooterProps) {
  return (
    <div
      className={clsx(
        "mt-4",
        border && "pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}

