"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  BarChart3,
  Search,
  ArrowLeft,
  Package,
  FileText,
  User,
  Star,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { serviceCenterService } from "@/features/service-centers/services/service-center.service";
import { inventoryRepository } from "@/core/repositories/inventory.repository";
// We don't have a direct jobCardRepository exported, but likely one exists or we define fetching here.
// I'll assume jobCardService is available or use apiClient directly if needed. 
// Actually I'll use jobCardService from features if exported, else define a simple fetcher.
// Checking imports... I'll use direct apiClient for simple lists if service is complex/unknown.
import { apiClient } from "@/core/api/client";

interface JobCard {
  id: string;
  jobCardNumber: string;
  vehicleId: string;
  vehicle: { registrationNumber: string; model: string; };
  status: string;
  serviceType: string;
  createdAt: string;
  customer: { name: string; phone: string; };
}

interface Vehicle {
  id: string;
  registration: string;
  vehicleModel: string;
  vehicleYear: number;
  vin: string;
  customer: { name: string; phone: string; };
}

const actionButtons = [
  { name: "Overview", icon: BarChart3 },
  { name: "Staff", icon: User },
  { name: "Inventory", icon: Package },
  { name: "Job Cards", icon: FileText },
  // { name: "Vehicle Search", icon: Search }, // Removing separate Vehicle Search for now, can perform via list? Or add back.
  // Adding back as requested "everything connected"
  { name: "Vehicles", icon: Search },
];

export default function ServiceCenterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const centerId = params?.id as string;
  const [activeTab, setActiveTab] = useState("Overview");

  // Fetch Service Center
  const { data: center, isLoading: centerLoading, isError: centerError } = useQuery({
    queryKey: ['serviceCenter', centerId],
    queryFn: () => serviceCenterService.getById(centerId),
    enabled: !!centerId,
  });

  // Fetch Inventory (Enabled if tab is Inventory)
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory', centerId],
    queryFn: () => inventoryRepository.getAll({ serviceCenterId: centerId }),
    enabled: !!centerId && activeTab === "Inventory",
  });

  // Fetch Job Cards
  const { data: jobCards = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobCards', centerId],
    queryFn: async () => {
      const res = await apiClient.get<JobCard[]>('/job-cards', { params: { serviceCenterId: centerId } });
      return res.data;
    },
    enabled: !!centerId && activeTab === "Job Cards",
  });

  // Fetch Vehicles (Connected to this center? Or all? Usually SC views vehicles they serviced)
  // Backend vehicle model has lastServiceCenterId.
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles', centerId],
    queryFn: async () => {
      // This is an assumption. If detailed search needed, we need a better endpoint.
      // For now, listing vehicles 'associated' or just global search?
      // User "Vehicle Search" usually implies searching ALL vehicles.
      // But in SC context, maybe just theirs.
      // I'll fetch ALL for now (admin view) but maybe limit?
      // Or use the vehicle repository search.
      const res = await apiClient.get<Vehicle[]>('/vehicles', { params: { limit: 50, lastServiceCenterId: centerId } });
      return res.data;
    },
    enabled: !!centerId && activeTab === "Vehicles",
  });

  if (centerLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (centerError || !center) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col">
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <h2 className="text-xl font-semibold text-gray-800">Service Center Not Found</h2>
        <button
          onClick={() => router.push('/servicecenters')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to List
        </button>
      </div>
    );
  }

  const location = [center.address, center.city, center.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{center.name}</h1>
          <p className="text-gray-500">{location}</p>
          <p className="text-sm text-gray-400 font-mono mt-1">{center.code}</p>
        </div>
        <button
          onClick={() => router.push("/servicecenters")}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to List
        </button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${center.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {center.status}
        </span>
        {/* Rating Placeholder */}
        <div className="flex items-center gap-1 text-yellow-600">
          <Star size={16} fill="currentColor" />
          <span className="font-medium">4.5</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6 overflow-x-auto">
        <div className="flex space-x-2">
          {actionButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeTab === btn.name;
            return (
              <button
                key={btn.name}
                onClick={() => setActiveTab(btn.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon size={16} />
                {btn.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Total Staff</p>
              <p className="text-3xl font-bold text-gray-800">{center._count?.users || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Active Job Cards</p>
              <p className="text-3xl font-bold text-gray-800">{center._count?.jobCards || 0}</p>
            </div>
            {/* Placeholders for now */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-60">
              <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-800">--</p>
              <p className="text-xs text-gray-400">Coming soon</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Service Radius</p>
              <p className="text-3xl font-bold text-gray-800">{center.serviceRadius || 0} km</p>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === "Staff" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Staff Members</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {center.users && center.users.length > 0 ? (
                center.users.map((user: any) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium capitalize">
                      {user.role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No staff assigned yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === "Inventory" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Inventory</h3>
              <span className="text-xs text-gray-500">{inventory.length} Items</span>
            </div>
            {inventoryLoading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin inline-block text-indigo-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-4">Part Name</th>
                      <th className="p-4">Number</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventory.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium">{item.partName}</td>
                        <td className="p-4 text-gray-600">{item.partNumber}</td>
                        <td className="p-4 text-gray-600">{item.category}</td>
                        <td className={`p-4 text-right font-medium ${item.quantity < (item.minLevel || 0) ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                    {inventory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">No inventory found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Job Cards Tab */}
        {activeTab === "Job Cards" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Job Cards</h3>
              <span className="text-xs text-gray-500">{jobCards.length} Jobs</span>
            </div>
            {jobsLoading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin inline-block text-indigo-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-4">Job #</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobCards.map((job: JobCard) => (
                      <tr key={job.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/sc/job-cards/${job.id}`)}>
                        <td className="p-4 font-medium text-indigo-600">{job.jobCardNumber}</td>
                        <td className="p-4">
                          <div className="font-medium">{job.vehicle?.registrationNumber || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{job.vehicle?.model}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{job.customer?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{job.customer?.phone}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{job.serviceType}</td>
                      </tr>
                    ))}
                    {jobCards.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">No job cards found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === "Vehicles" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Associated Vehicles</h3>
            </div>
            {vehiclesLoading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin inline-block text-indigo-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="p-4">Registration</th>
                      <th className="p-4">Model</th>
                      <th className="p-4">VIN</th>
                      <th className="p-4">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vehicles.map((v: Vehicle) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium">{v.registration}</td>
                        <td className="p-4 text-gray-600">{v.vehicleModel} ({v.vehicleYear})</td>
                        <td className="p-4 font-mono text-gray-500">{v.vin}</td>
                        <td className="p-4">
                          <div className="font-medium">{v.customer?.name}</div>
                          <div className="text-xs text-gray-500">{v.customer?.phone}</div>
                        </td>
                      </tr>
                    ))}
                    {vehicles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">No vehicles found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}