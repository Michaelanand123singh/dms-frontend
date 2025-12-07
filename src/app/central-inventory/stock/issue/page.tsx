"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building, Search, ArrowRight } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import type { ServiceCenterInfo } from "@/shared/types/central-inventory.types";

export default function IssuePartsPage() {
  const router = useRouter();
  const [serviceCenters, setServiceCenters] = useState<ServiceCenterInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServiceCenters = async () => {
      try {
        const centers = await centralInventoryRepository.getAllServiceCenters();
        setServiceCenters(centers.filter((sc) => sc.active));
      } catch (error) {
        console.error("Failed to fetch service centers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceCenters();
  }, []);

  const filteredCenters = serviceCenters.filter(
    (sc) =>
      sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sc.location && sc.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectServiceCenter = (serviceCenterId: string) => {
    router.push(`/central-inventory/stock/issue/${serviceCenterId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading service centers...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Issue Parts</h1>
          <p className="text-gray-500">Select a service center to issue parts</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Select Service Center</h2>
          </CardHeader>
          <CardBody>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search service center..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCenters.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No service centers found</p>
                </div>
              ) : (
                filteredCenters.map((center) => (
                  <button
                    key={center.id}
                    onClick={() => handleSelectServiceCenter(center.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Building className="w-6 h-6 text-blue-600" />
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{center.name}</h3>
                    {center.location && (
                      <p className="text-sm text-gray-500 mb-2">{center.location}</p>
                    )}
                    {center.contactPerson && (
                      <p className="text-xs text-gray-400">Contact: {center.contactPerson}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

