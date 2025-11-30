"use client";
import { ReactNode } from "react";
import clsx from "clsx";

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
}

export function CardHeader({ children, className, border = true }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        "mb-4",
        border && "pb-4",
        className
      )}
    >
      {children}
    </div>
  );
}

