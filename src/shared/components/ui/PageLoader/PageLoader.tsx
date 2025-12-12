"use client";
import { Building2 } from "lucide-react";

export interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function PageLoader({ message = "Loading...", fullScreen = false }: PageLoaderProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm"
    : "absolute inset-0 z-50 flex justify-center bg-white/95 backdrop-blur-sm";

  const contentClasses = fullScreen
    ? "flex flex-col items-center gap-6"
    : "flex flex-col items-center gap-6 pt-32";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>

        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#6f42c1]/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-[#6f42c1] rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    </div>
  );
}

