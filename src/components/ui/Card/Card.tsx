"use client";
import { ReactNode } from "react";
import clsx from "clsx";

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
}

export function Card({ 
  children, 
  className, 
  padding = "md",
  shadow = "md"
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md hover:shadow-lg transition-shadow duration-200",
    lg: "shadow-lg hover:shadow-xl transition-shadow duration-200",
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-xl border border-gray-200/80 backdrop-blur-sm",
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
    >
      {children}
    </div>
  );
}

