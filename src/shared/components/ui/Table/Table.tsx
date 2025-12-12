"use client";
import { ReactNode } from "react";
import clsx from "clsx";

export interface TableProps {
  children: ReactNode;
  className?: string;
  striped?: boolean;
  hover?: boolean;
}

export function Table({ children, className, striped = false, hover = false }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx(
          "w-full border-collapse",
          striped && "[&>tbody>tr:nth-child(even)]:bg-gray-50",
          hover && "[&>tbody>tr]:hover:bg-gray-50",
          className
        )}
      >
        {children}
      </table>
    </div>
  );
}

