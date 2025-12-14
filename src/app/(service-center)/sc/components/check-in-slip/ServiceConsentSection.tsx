"use client";
import { useState } from "react";
import { Upload, X, User } from "lucide-react";
import { FormInput } from "../shared";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";

interface ServiceConsentSectionProps {
  formData: CheckInSlipFormData;
  onUpdate: (updates: Partial<CheckInSlipFormData>) => void;
  defaultServiceAdvisor?: string;
}

export function ServiceConsentSection({
  formData,
  onUpdate,
  defaultServiceAdvisor,
}: ServiceConsentSectionProps) {
  const [receivingSignaturePreview, setReceivingSignaturePreview] = useState<string | null>(null);
  const [customerSignaturePreview, setCustomerSignaturePreview] = useState<string | null>(null);

  const handleSignatureUpload = (
    field: "receivingSignature" | "customerSignature",
    file: File | null
  ) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onUpdate({ [field]: result });
      if (field === "receivingSignature") {
        setReceivingSignaturePreview(result);
      } else {
        setCustomerSignaturePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
      <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-yellow-600 rounded"></span>
        4. Service & Customer Consent
      </h4>
      <div className="space-y-4">
        <FormInput
          label="Service Advisor"
          value={formData.serviceAdvisor || defaultServiceAdvisor || ""}
          onChange={(e) => onUpdate({ serviceAdvisor: e.target.value })}
          placeholder="Enter service advisor name"
        />

        {/* Receiving Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receiving Signature
          </label>
          {receivingSignaturePreview || formData.receivingSignature ? (
            <div className="relative border-2 border-gray-300 rounded-lg p-4 bg-white">
              <img
                src={receivingSignaturePreview || formData.receivingSignature}
                alt="Receiving Signature"
                className="max-h-32 mx-auto"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdate({ receivingSignature: undefined });
                  setReceivingSignaturePreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <User className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Upload receiving signature</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleSignatureUpload("receivingSignature", e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        {/* Customer Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Signature
          </label>
          {customerSignaturePreview || formData.customerSignature ? (
            <div className="relative border-2 border-gray-300 rounded-lg p-4 bg-white">
              <img
                src={customerSignaturePreview || formData.customerSignature}
                alt="Customer Signature"
                className="max-h-32 mx-auto"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdate({ customerSignature: undefined });
                  setCustomerSignaturePreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <User className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Upload customer signature</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleSignatureUpload("customerSignature", e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="customerAcceptsTerms"
            checked={formData.customerAcceptsTerms || false}
            onChange={(e) => onUpdate({ customerAcceptsTerms: e.target.checked })}
            className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="customerAcceptsTerms" className="text-sm text-gray-700">
            Customer accepts terms and conditions
            <br />
            <span className="font-semibold text-gray-900">
              Customer of ROTTY TWO EV TECH AND SERVICES PVT LTD
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}


