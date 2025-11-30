"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

interface Approval {
  id: string;
  type: string;
  description: string;
  customer: string;
  amount: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

export default function Approvals() {
  const [approvals, setApprovals] = useState<Approval[]>([
    {
      id: "APP-001",
      type: "Appointment",
      description: "Routine maintenance - ₹3,500",
      customer: "Rajesh Kumar",
      amount: "₹3,500",
      status: "Pending",
      date: "2025-01-15",
    },
  ]);

  const handleApprove = (id: string): void => {
    setApprovals(approvals.map(a => a.id === id ? {...a, status: "Approved"} : a));
    alert("Request approved!");
  };

  const handleReject = (id: string): void => {
    setApprovals(approvals.map(a => a.id === id ? {...a, status: "Rejected"} : a));
    alert("Request rejected!");
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Approvals</h1>
          <p className="text-gray-500">Review and approve pending requests</p>
        </div>

        <div className="space-y-4">
          {approvals.map((approval) => (
            <div key={approval.id} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">{approval.id}</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      {approval.status}
                    </span>
                  </div>
                  <p className="text-gray-700">{approval.description}</p>
                  <p className="text-sm text-gray-500 mt-1">{approval.customer} • {approval.date}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

