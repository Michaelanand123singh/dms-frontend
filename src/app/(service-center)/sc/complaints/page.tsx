"use client";
import { useState } from "react";
import { AlertCircle, Search, Filter, Eye, CheckCircle } from "lucide-react";
import { defaultComplaints, type Complaint } from "@/__mocks__/data/complaints.mock";

type FilterType = "all" | "open" | "resolved" | "closed";

export default function Complaints() {
  const [filter, setFilter] = useState<FilterType>("all");

  // Use mock data from __mocks__ folder
  const complaints: Complaint[] = defaultComplaints;

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Complaints</h1>
          <p className="text-gray-500">Manage and resolve customer complaints</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{complaint.id}</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    {complaint.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{complaint.complaint}</p>
                <p className="text-xs text-gray-500 mt-2">{complaint.customerName} • {complaint.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

