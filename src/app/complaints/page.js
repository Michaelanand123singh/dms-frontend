"use client";

import { AlertCircle } from "lucide-react";

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-purple-600" size={48} />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Coming Soon</h1>
        <p className="text-xl text-gray-600 mb-2">Complaints</p>
        <p className="text-gray-500">This page is under development and will be available soon.</p>
      </div>
    </div>
  );
}

