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
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6f42c1] to-[#9b6dff] blur-2xl rounded-3xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-[#6f42c1] to-[#9b6dff] p-6 rounded-3xl shadow-2xl animate-bounce">
            <Building2 size={48} className="text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#6f42c1]/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-[#6f42c1] rounded-full animate-spin absolute top-0 left-0"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800 mb-1">{message}</p>
          <div className="flex gap-1 justify-center mt-2">
            <div className="w-2 h-2 bg-[#6f42c1] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-[#6f42c1] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-[#6f42c1] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

