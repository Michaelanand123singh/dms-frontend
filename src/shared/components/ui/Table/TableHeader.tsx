"use client";
import { ReactNode } from "react";
import clsx from "clsx";

export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={clsx("bg-gray-50 border-b border-gray-200", className)}>
      {children}
    </thead>
  );
}

