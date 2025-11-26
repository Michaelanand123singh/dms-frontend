"use client";
import { useEffect, useState } from "react";

export interface TopLoadingBarProps {
  isLoading?: boolean;
}

export function TopLoadingBar({ isLoading = false }: TopLoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }
          // Increment with decreasing rate for smooth animation
          const increment = Math.random() * 15;
          return Math.min(prev + increment, 90);
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Complete the progress and hide
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(37, 99, 235, 0.5)",
        }}
      />
    </div>
  );
}

