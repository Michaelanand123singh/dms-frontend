"use client";
import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import type { CheckInSlipFormData } from "@/shared/types/check-in-slip.types";

interface VehicleConditionSectionProps {
  formData: CheckInSlipFormData;
  onUpdate: (updates: Partial<CheckInSlipFormData>) => void;
}

export function VehicleConditionSection({
  formData,
  onUpdate,
}: VehicleConditionSectionProps) {
  const [imagePreviews, setImagePreviews] = useState<{
    front?: string;
    rear?: string;
    right?: string;
    left?: string;
    damages?: string[];
  }>({
    damages: [],
  });

  const handleImageUpload = (
    field: "vehicleImageFront" | "vehicleImageRear" | "vehicleImageRight" | "vehicleImageLeft",
    file: File | null
  ) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onUpdate({ [field]: result });
      setImagePreviews((prev) => ({ ...prev, [field.replace("vehicleImage", "").toLowerCase()]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDamageImageUpload = (file: File | null) => {
    if (!file) return;
    if ((formData.vehicleImageDamages?.length || 0) >= 5) {
      alert("Maximum 5 damage images allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const currentDamages = formData.vehicleImageDamages || [];
      onUpdate({ vehicleImageDamages: [...currentDamages, result] });
      setImagePreviews((prev) => ({
        ...prev,
        damages: [...(prev.damages || []), result],
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeDamageImage = (index: number) => {
    const currentDamages = formData.vehicleImageDamages || [];
    const updated = currentDamages.filter((_, i) => i !== index);
    onUpdate({ vehicleImageDamages: updated });
    setImagePreviews((prev) => ({
      ...prev,
      damages: prev.damages?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded"></span>
        2. Vehicle Image & Condition Check
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Front Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Image Front
          </label>
          {imagePreviews.front ? (
            <div className="relative">
              <img src={imagePreviews.front} alt="Front" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  onUpdate({ vehicleImageFront: undefined });
                  setImagePreviews((prev) => ({ ...prev, front: undefined }));
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Click to upload</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload("vehicleImageFront", e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        {/* Rear Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Image Rear
          </label>
          {imagePreviews.rear ? (
            <div className="relative">
              <img src={imagePreviews.rear} alt="Rear" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  onUpdate({ vehicleImageRear: undefined });
                  setImagePreviews((prev) => ({ ...prev, rear: undefined }));
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Click to upload</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload("vehicleImageRear", e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        {/* Right Side Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Image Right Side
          </label>
          {imagePreviews.right ? (
            <div className="relative">
              <img src={imagePreviews.right} alt="Right" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  onUpdate({ vehicleImageRight: undefined });
                  setImagePreviews((prev) => ({ ...prev, right: undefined }));
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Click to upload</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload("vehicleImageRight", e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        {/* Left Side Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Image Left Side
          </label>
          {imagePreviews.left ? (
            <div className="relative">
              <img src={imagePreviews.left} alt="Left" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  onUpdate({ vehicleImageLeft: undefined });
                  setImagePreviews((prev) => ({ ...prev, left: undefined }));
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Click to upload</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload("vehicleImageLeft", e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Other Damages Images (Max 5) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Other Damages Part Images (Max 5)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {formData.vehicleImageDamages?.map((img, index) => (
            <div key={index} className="relative">
              <img src={img} alt={`Damage ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeDamageImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {(formData.vehicleImageDamages?.length || 0) < 5 && (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <ImageIcon className="w-6 h-6 text-gray-400" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleDamageImageUpload(e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Charger Given */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="chargerGiven"
          checked={formData.chargerGiven || false}
          onChange={(e) => onUpdate({ chargerGiven: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="chargerGiven" className="text-sm font-medium text-gray-700">
          Charger given
        </label>
      </div>
    </div>
  );
}


