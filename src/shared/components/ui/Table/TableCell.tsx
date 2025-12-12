"use client";
import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function TableCell({ 
  children, 
  className, 
  align = "left",
  ...props 
}: TableCellProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      className={clsx(
        "px-4 py-3 text-sm text-gray-900",
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

