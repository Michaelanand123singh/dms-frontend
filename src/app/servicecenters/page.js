"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X } from "lucide-react";

export default function ServiceCentersPage() {
  const router = useRouter();
  const [centers, setCenters] = useState([
    {
      id: 1,
      name: "Delhi Central Hub",
      location: "Connaught Place, New Delhi",
      staff: 3,
      jobs: 12,
      revenue: "₹12.4L",
      status: "Active",
      rating: 4.9,
    },
    {
      id: 2,
      name: "Mumbai Metroplex",
      location: "Bandra West, Mumbai",
      staff: 3,
      jobs: 18,
      revenue: "₹18.9L",
      status: "Active",
      rating: 4.8,
    },
    {
      id: 3,
      name: "Bangalore Innovation Center",
      location: "Koramangala, Bangalore",
      staff: 2,
      jobs: 15,
      revenue: "₹15.6L",
      status: "Active",
      rating: 4.9,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    staff: "",
    jobs: "",
    status: "Active",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return alert("Fill required fields");

    const newCenter = {
      id: centers.length + 1,
      ...form,
      staff: Number(form.staff) || 0,
      jobs: Number(form.jobs) || 0,
      revenue: "₹0.0L",
      rating: 4.5,
    };

    setCenters([...centers, newCenter]);
    setForm({ name: "", location: "", staff: "", jobs: "", status: "Active" });
    setShowForm(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Service Centers</h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {centers.map((center) => (
          <div
            key={center.id}
            onClick={() => router.push(`/servicecenters/${center.id}`)}
            className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 break-words">{center.name}</h2>
              <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 break-words">{center.location}</p>

              <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                <p className="flex justify-between">
                  <span>Staff</span>
                  <span className="font-medium ml-2">{center.staff}</span>
                </p>
                <p className="flex justify-between">
                  <span>Active Jobs</span>
                  <span className="font-medium ml-2">{center.jobs}</span>
                </p>
                <p className="flex justify-between">
                  <span>Revenue</span>
                  <span className="font-semibold ml-2">{center.revenue}</span>
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex items-center justify-between">
              <span
                className={`text-xs font-medium px-2 sm:px-3 py-1 rounded-full ${
                  center.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {center.status}
              </span>

              <div className="flex items-center text-yellow-500 text-xs sm:text-sm">
                <Star size={12} className="sm:w-3.5 sm:h-3.5" fill="gold" stroke="gold" />
                <span className="ml-1">{center.rating}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add Center Card */}
        <div
          onClick={() => setShowForm(true)}
          className="bg-white border-2 border-dashed border-indigo-300 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500 transition p-4 sm:p-5 flex flex-col items-center justify-center cursor-pointer min-h-[180px] sm:min-h-[200px]"
        >
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl font-bold text-indigo-600">+</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Add New Center</h2>
            <p className="text-gray-500 text-xs sm:text-sm px-2">Click to add a new service center</p>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
              onClick={() => setShowForm(false)}
            >
              <X size={18} />
            </button>

            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 pr-8">Add New Center</h2>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Center Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Staff</label>
                  <input
                    type="number"
                    value={form.staff}
                    onChange={(e) => setForm({ ...form, staff: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Active Jobs</label>
                  <input
                    type="number"
                    value={form.jobs}
                    onChange={(e) => setForm({ ...form, jobs: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition"
              >
                Add Center
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
