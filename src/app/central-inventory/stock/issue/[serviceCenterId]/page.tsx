"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Building, Package } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useToast } from "@/contexts/ToastContext";
import { centralInventoryRepository } from "@/__mocks__/repositories/central-inventory.repository";
import { adminApprovalService } from "@/features/inventory/services/adminApproval.service";
import { PartsIssueForm } from "@/app/central-inventory/components/PartsIssueForm";
import type {
  ServiceCenterInfo,
  CentralStock,
  PurchaseOrder,
  PartsIssueFormData,
} from "@/shared/types/central-inventory.types";

export default function StockIssuePage() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError } = useToast();
  const serviceCenterId = params.serviceCenterId as string;

  const [serviceCenter, setServiceCenter] = useState<ServiceCenterInfo | null>(null);
  const [availableStock, setAvailableStock] = useState<CentralStock[]>([]);
  const [availablePOs, setAvailablePOs] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service center
        const sc = await centralInventoryRepository.getServiceCenterById(serviceCenterId);
        if (!sc) {
          router.push("/central-inventory/stock/issue");
          return;
        }
        setServiceCenter(sc);

        // Fetch available stock
        const stock = await centralInventoryRepository.getAllStock();
        setAvailableStock(stock.filter((s) => s.currentQty > 0));

        // Fetch purchase orders for this service center
        const pos = await centralInventoryRepository.getPurchaseOrdersByServiceCenter(serviceCenterId);
        setAvailablePOs(pos.filter((po) => po.status === "approved"));
      } catch (error) {
        console.error("Failed to fetch data:", error);
        showError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceCenterId) {
      fetchData();
    }
  }, [serviceCenterId, router, showError]);

  const handleSubmit = async (formData: PartsIssueFormData) => {
    setIsSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{"name": "Central Inventory Manager"}');
      // Create parts issue request (pending admin approval)
      const request = await adminApprovalService.createPartsIssueRequest(
        formData,
        userInfo.name || "Central Inventory Manager"
      );
      showSuccess("Parts issue request submitted successfully! Waiting for admin approval.");
      setTimeout(() => {
        router.push("/central-inventory/stock");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit parts issue request:", error);
      showError(error instanceof Error ? error.message : "Failed to submit parts issue request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/central-inventory/stock/issue");
  };

  if (isLoading) {
    return (
      <div className="bg-[#f9f9fb] min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!serviceCenter) {
    return null;
  }

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-600">Issue Parts</h1>
          </div>
          <p className="text-gray-500">
            Issue parts from central warehouse to {serviceCenter.name}
          </p>
        </div>

        <PartsIssueForm
          serviceCenter={serviceCenter}
          availableStock={availableStock}
          availablePurchaseOrders={availablePOs}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
