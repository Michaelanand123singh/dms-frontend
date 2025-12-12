"use client";
import { LucideIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  className,
}: StatsCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card className={className}>
      <CardBody>
        <div className="flex items-center justify-between mb-2">
          {Icon && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon size={20} className="text-blue-600" />
            </div>
          )}
          {change && (
            <span className={`text-sm font-medium ${trendColors[trend]}`}>
              {change}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </CardBody>
    </Card>
  );
}

