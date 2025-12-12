"use client";
import { ReactNode } from "react";
import clsx from "clsx";

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={clsx("", className)}>
      {children}
    </div>
  );
}

