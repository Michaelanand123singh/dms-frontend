"use client";
import { useState } from "react";
import {
  Search,
  Car,
  User,
  Calendar,
  Wrench,
  FileText,
  PlusCircle,
  History,
  Phone,
  Hash,
  CreditCard,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import type { SearchType, Vehicle, ServiceHistoryItem, NewVehicleForm } from "@/shared/types";
import { defaultVehicles, defaultVehicleServiceHistory } from "@/__mocks__/data/vehicles.mock";

export default function VehicleSearch() {
  const [searchType, setSearchType] = useState<SearchType>("phone");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Vehicle | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState<boolean>(false);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const [vehiclePhotos, setVehiclePhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean>(false);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[]>([]);
  
  // Form state for adding new vehicle
  const [newVehicleForm, setNewVehicleForm] = useState<Partial<NewVehicleForm>>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    vehicleBrand: "",
    vehicleModel: "",
    registrationNumber: "",
    vin: "",
    vehicleYear: "",
    vehicleColor: "",
    registration: "", // Legacy field for backward compatibility
    vehicleMake: "", // Legacy field for backward compatibility
  });

  // Use mock data from __mocks__ folder
  const mockVehicles = defaultVehicles;
  const mockServiceHistory = defaultVehicleServiceHistory;

  const validateSearchInput = (): boolean => {
    setValidationError("");
    
    if (!searchQuery.trim()) {
      setValidationError("Please enter a search query");
      return false;
    }

    if (searchType === "phone") {
      // Remove spaces, dashes, and country code
      const cleaned = searchQuery.replace(/[\s-+]/g, "").replace(/^91/, "");
      if (cleaned.length !== 10 || !/^\d{10}$/.test(cleaned)) {
        setValidationError("Please enter a valid 10-digit phone number");
        return false;
      }
    } else if (searchType === "vin") {
      if (searchQuery.length !== 17) {
        setValidationError("VIN must be exactly 17 characters");
        return false;
      }
    }

    return true;
  };

  const handleSearch = (): void => {
    if (!validateSearchInput()) {
      return;
    }

    // Normalize phone number for search
    let searchValue = searchQuery.trim();
    if (searchType === "phone") {
      searchValue = searchValue.replace(/[\s-+]/g, "").replace(/^91/, "");
    }

    // Mock search logic
    let found: Vehicle | undefined = undefined;
    if (searchType === "phone") {
      found = mockVehicles.find((v) => v.phone.includes(searchValue));
    } else if (searchType === "registration") {
      found = mockVehicles.find((v) =>
        v.registration.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else if (searchType === "vin") {
      found = mockVehicles.find((v) =>
        v.vin.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (found) {
      setSearchResults(found);
      setServiceHistory(mockServiceHistory);
      setShowAddVehicle(false);
    } else {
      setSearchResults(null);
      setShowAddVehicle(true);
    }
  };

  const handleAddNewVehicle = (): void => {
    setShowAddVehicleForm(true);
    // Pre-fill form with search query if applicable
    if (searchType === "phone") {
      setNewVehicleForm((prev) => ({
        ...prev,
        customerPhone: searchQuery.replace(/[\s-+]/g, "").replace(/^91/, ""),
      }));
    } else if (searchType === "registration") {
      setNewVehicleForm((prev) => ({
        ...prev,
        registrationNumber: searchQuery.toUpperCase(),
        registration: searchQuery.toUpperCase(), // Legacy field
      }));
    } else if (searchType === "vin") {
      setNewVehicleForm((prev) => ({
        ...prev,
        vin: searchQuery.toUpperCase(),
      }));
    }
  };

  const handleSaveNewVehicle = (): void => {
    // Validate form
    if (!newVehicleForm.customerName || !newVehicleForm.customerPhone || 
        !newVehicleForm.vehicleBrand || !newVehicleForm.vehicleModel || 
        !newVehicleForm.registrationNumber) {
      setValidationError("Please fill all required fields");
      return;
    }

    if (newVehicleForm.customerPhone && (newVehicleForm.customerPhone.length !== 10 || !/^\d{10}$/.test(newVehicleForm.customerPhone))) {
      setValidationError("Phone number must be 10 digits");
      return;
    }

    if (newVehicleForm.vin && newVehicleForm.vin.length !== 17) {
      setValidationError("VIN must be exactly 17 characters");
      return;
    }

    // Save vehicle (in real app, this would be an API call)
    alert("Vehicle added successfully!");
    setShowAddVehicleForm(false);
    setShowAddVehicle(false);
    setSearchQuery("");
    setNewVehicleForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      vehicleBrand: "",
      vehicleModel: "",
      registrationNumber: "",
      vin: "",
      vehicleYear: "",
      vehicleColor: "",
      registration: "",
      vehicleMake: "",
    });
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Vehicle Search</h1>
          <p className="text-gray-500">Search vehicles by phone, registration, or VIN number</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Type Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
              <button
                onClick={() => setSearchType("phone")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === "phone"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </button>
              <button
                onClick={() => setSearchType("registration")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === "registration"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Hash size={16} className="inline mr-2" />
                Registration
              </button>
              <button
                onClick={() => setSearchType("vin")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === "vin"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <CreditCard size={16} className="inline mr-2" />
                VIN Number
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={
                  searchType === "phone"
                    ? "Enter 10-digit phone number"
                    : searchType === "registration"
                    ? "Enter registration number (e.g., PB10AB1234)"
                    : "Enter VIN number (17 characters)"
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setValidationError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                maxLength={searchType === "vin" ? 17 : undefined}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {validationError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validationError}
                </p>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md"
            >
              Search
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults ? (
          <div className="space-y-6">
            {/* Vehicle Details Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Car className="text-blue-600" size={28} />
                  Vehicle Details
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/sc/job-cards?action=create&vehicleId=${searchResults.id}`}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                    Create Job Card
                  </Link>
                  <Link
                    href={`/sc/invoices?action=create&vehicleId=${searchResults.id}`}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Generate Invoice
                  </Link>
                  <Link
                    href={`/sc/appointments?action=create&vehicleId=${searchResults.id}`}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2"
                  >
                    <Calendar size={16} />
                    Schedule Appointment
                  </Link>
                  <Link
                    href={`/sc/invoices?vehicleId=${searchResults.id}`}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2"
                  >
                    <History size={16} />
                    View Service History
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">Name:</span>{" "}
                      <span className="text-gray-800">{searchResults.customerName}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Phone:</span>{" "}
                      <span className="text-gray-800">{searchResults.phone}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Email:</span>{" "}
                      <span className="text-gray-800">{searchResults.customerEmail}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Address:</span>{" "}
                      <span className="text-gray-800">{searchResults.customerAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Car size={20} />
                    Vehicle Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">Make/Model:</span>{" "}
                      <span className="text-gray-800">
                        {searchResults.vehicleMake} {searchResults.vehicleModel}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Year:</span>{" "}
                      <span className="text-gray-800">{searchResults.vehicleYear}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Color:</span>{" "}
                      <span className="text-gray-800">{searchResults.vehicleColor}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Registration:</span>{" "}
                      <span className="text-gray-800">{searchResults.registration}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">VIN:</span>{" "}
                      <span className="text-gray-800 font-mono text-xs">{searchResults.vin}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="mt-6 mb-4">
                <div className={`p-4 rounded-xl ${
                  searchResults.currentStatus === "Active Job Card" 
                    ? "bg-orange-50 border-2 border-orange-200" 
                    : "bg-green-50 border-2 border-green-200"
                }`}>
                  <div className="flex items-center gap-3">
                    {searchResults.currentStatus === "Active Job Card" ? (
                      <Clock className="text-orange-600" size={20} />
                    ) : (
                      <CheckCircle className="text-green-600" size={20} />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Current Status</p>
                      <p className={`text-lg font-bold ${
                        searchResults.currentStatus === "Active Job Card" 
                          ? "text-orange-700" 
                          : "text-green-700"
                      }`}>
                        {searchResults.currentStatus}
                        {searchResults.activeJobCardId && (
                          <span className="ml-2 text-sm font-normal">
                            ({searchResults.activeJobCardId})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Last Service Date</p>
                  <p className="text-lg font-bold text-gray-800">{searchResults.lastServiceDate}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Total Services</p>
                  <p className="text-lg font-bold text-gray-800">{searchResults.totalServices}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-lg font-bold text-gray-800">{searchResults.totalSpent}</p>
                </div>
              </div>

              {/* Vehicle Photo Upload Section */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="text-blue-600" size={20} />
                  Vehicle Photos (Check-in Documentation)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Capture vehicle photos during check-in to document condition and avoid disputes about scratches/damage later.
                </p>
                
                <div className="space-y-4">
                  {/* Photo Upload Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Vehicle Photos
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2">
                        <Upload size={18} />
                        Choose Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setVehiclePhotos([...vehiclePhotos, ...files]);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          // Upload photos
                          if (vehiclePhotos.length === 0) {
                            alert("Please select photos to upload");
                            return;
                          }
                          
                          setUploadingPhotos(true);
                          try {
                            const token = safeStorage.getItem<string | null>("authToken", null);
                            const formData = new FormData();
                            
                            vehiclePhotos.forEach((photo) => {
                              formData.append("files", photo);
                            });
                            
                            // Note: This is a simplified version. In production, you'd need to:
                            // 1. Upload to storage (Supabase/local)
                            // 2. Get URLs back
                            // 3. Create VehiclePhoto records via API
                            
                            // For now, simulate upload
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            
                            alert(`${vehiclePhotos.length} photo(s) uploaded successfully!`);
                            setVehiclePhotos([]);
                            setUploadedPhotoUrls([...uploadedPhotoUrls, ...vehiclePhotos.map((_, i) => URL.createObjectURL(vehiclePhotos[i]))]);
                          } catch (error) {
                            console.error("Error uploading photos:", error);
                            alert("Failed to upload photos. Please try again.");
                          } finally {
                            setUploadingPhotos(false);
                          }
                        }}
                        disabled={vehiclePhotos.length === 0 || uploadingPhotos}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingPhotos ? "Uploading..." : "Upload Photos"}
                      </button>
                    </div>
                  </div>

                  {/* Preview Uploaded Photos */}
                  {vehiclePhotos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Selected Photos ({vehiclePhotos.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {vehiclePhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Vehicle photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setVehiclePhotos(vehiclePhotos.filter((_, i) => i !== index));
                              }}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display Previously Uploaded Photos */}
                  {uploadedPhotoUrls.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded Photos
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedPhotoUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Uploaded photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Service History */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <History className="text-purple-600" size={28} />
                Service History
              </h2>

              {serviceHistory.length > 0 ? (
                <div className="space-y-4">
                  {serviceHistory.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                              {service.type}
                            </span>
                            <span className="text-sm text-gray-600">
                              <Calendar size={14} className="inline mr-1" />
                              {service.date}
                            </span>
                            <span className="text-sm text-gray-600">
                              <Wrench size={14} className="inline mr-1" />
                              {service.engineer}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Odometer: {service.odometer}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {service.parts.map((part, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {part}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 text-right">
                          <p className="text-sm text-gray-600">Labor: {service.labor}</p>
                          <p className="text-sm text-gray-600">Parts: {service.partsCost}</p>
                          <p className="text-lg font-bold text-gray-800 mt-1">
                            Total: {service.total}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Invoice: {service.invoice}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Next Scheduled Service Reminder */}
                  {searchResults.nextServiceDate && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-blue-600" size={24} />
                        <div>
                          <p className="text-sm text-gray-600">Next Scheduled Service</p>
                          <p className="text-lg font-bold text-blue-700">
                            {searchResults.nextServiceDate}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended based on last service date
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No service history found</p>
              )}
            </div>
          </div>
        ) : showAddVehicle && searchQuery ? (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-center py-8">
              <Car className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Vehicle Not Found</h3>
              <p className="text-gray-500 mb-6">
                No vehicle found with the provided {searchType === "phone" ? "phone number" : searchType === "registration" ? "registration number" : "VIN"}
              </p>
              <button
                onClick={handleAddNewVehicle}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
              >
                <PlusCircle size={20} />
                Add New Vehicle
              </button>
            </div>
          </div>
        ) : null}

        {/* Add New Vehicle Form Modal */}
        {showAddVehicleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Add New Vehicle</h2>
                <button
                  onClick={() => {
                    setShowAddVehicleForm(false);
                    setValidationError("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <p className="text-red-600 text-sm">{validationError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVehicleForm.customerName}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, customerName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newVehicleForm.customerPhone}
                      onChange={(e) =>
                        setNewVehicleForm({
                          ...newVehicleForm,
                          customerPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      maxLength={10}
                      placeholder="10 digits"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newVehicleForm.customerEmail}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, customerEmail: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newVehicleForm.customerAddress}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, customerAddress: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVehicleForm.vehicleBrand || ""}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, vehicleBrand: e.target.value, vehicleMake: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVehicleForm.vehicleModel || ""}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, vehicleModel: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      value={newVehicleForm.vehicleYear || ""}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, vehicleYear: e.target.value })
                      }
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      value={newVehicleForm.vehicleColor || ""}
                      onChange={(e) =>
                        setNewVehicleForm({ ...newVehicleForm, vehicleColor: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVehicleForm.registrationNumber || ""}
                      onChange={(e) =>
                        setNewVehicleForm({
                          ...newVehicleForm,
                          registrationNumber: e.target.value.toUpperCase(),
                          registration: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VIN Number (17 characters)
                    </label>
                    <input
                      type="text"
                      value={newVehicleForm.vin || ""}
                      onChange={(e) =>
                        setNewVehicleForm({
                          ...newVehicleForm,
                          vin: e.target.value.toUpperCase().slice(0, 17),
                        })
                      }
                      maxLength={17}
                      placeholder="17 characters"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAddVehicleForm(false);
                      setValidationError("");
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewVehicle}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:opacity-90 transition"
                  >
                    Save Vehicle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

