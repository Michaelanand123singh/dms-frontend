"use client";
import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr className={clsx("border-b border-gray-200", className)} {...props}>
      {children}
    </tr>
  );
}

