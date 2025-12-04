"use client";
import React from "react";
import { Building2 } from "lucide-react";
import type { CustomerWithVehicles } from "@/shared/types";

export const ErrorAlert = ({ message }: { message: string }) => (
  <div className="bg-red-50 rounded-lg p-4 flex items-center gap-2">
    <div className="text-red-600">
      <span className="text-xl font-bold">!</span>
    </div>
    <p className="text-red-600 text-sm">{message}</p>
  </div>
);

export const InfoCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string | React.ReactNode;
}) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="p-2 rounded-lg bg-indigo-100">
      <Icon className="text-indigo-600" size={18} strokeWidth={2} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);

export const CustomerInfoCard = ({
  customer,
  title = "Customer Information",
}: {
  customer: CustomerWithVehicles;
  title?: string;
}) => (
  <div className="bg-indigo-50 rounded-lg p-4">
    <h3 className="text-sm font-semibold text-indigo-900 mb-3">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-indigo-600 font-medium">Name</p>
        <p className="text-gray-800 font-semibold">{customer.name}</p>
      </div>
      <div>
        <p className="text-indigo-600 font-medium">Phone</p>
        <p className="text-gray-800 font-semibold">{customer.phone}</p>
      </div>
      {customer.email && (
        <div>
          <p className="text-indigo-600 font-medium">Email</p>
          <p className="text-gray-800 font-semibold">{customer.email}</p>
        </div>
      )}
      {customer.address && (
        <div>
          <p className="text-indigo-600 font-medium">Address</p>
          <p className="text-gray-800 font-semibold">{customer.address}</p>
        </div>
      )}
      {customer.cityState && (
        <div>
          <p className="text-indigo-600 font-medium">City / State</p>
          <p className="text-gray-800 font-semibold">{customer.cityState}</p>
        </div>
      )}
      {customer.serviceCenterName && (
        <div className="flex items-center gap-1">
          <Building2 size={14} className="text-indigo-500" />
          <p className="text-xs text-gray-600">{customer.serviceCenterName}</p>
        </div>
      )}
    </div>
  </div>
);



