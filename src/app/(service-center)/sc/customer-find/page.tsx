"use client";
import { useState } from "react";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  PlusCircle,
  X,
  CheckCircle,
  Hash,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type {
  Customer,
  CustomerSearchType,
  CustomerWithVehicles,
  NewCustomerForm,
  Vehicle,
} from "@/shared/types";

export default function CustomerFind() {
  const [searchType, setSearchType] = useState<CustomerSearchType>("phone");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CustomerWithVehicles | null>(null);
  const [showCreateCustomer, setShowCreateCustomer] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<CustomerWithVehicles[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  // Form state for creating new customer
  const [newCustomerForm, setNewCustomerForm] = useState<NewCustomerForm>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Mock data - replace with API calls
  const mockCustomers: CustomerWithVehicles[] = [
    {
      id: 1,
      customerNumber: "CUST-2025-001",
      name: "Rajesh Kumar",
      phone: "9876543210",
      email: "rajesh@example.com",
      address: "123 Main St, Pune, Maharashtra",
      createdAt: "2024-01-15",
      totalVehicles: 2,
      totalSpent: "₹45,000",
      lastServiceDate: "2024-12-15",
      vehicles: [
        {
          id: 1,
          customerId: 1,
          customerNumber: "CUST-2025-001",
          phone: "9876543210",
          registration: "PB10AB1234",
          vin: "MH12AB3456CD7890",
          customerName: "Rajesh Kumar",
          customerEmail: "rajesh@example.com",
          customerAddress: "123 Main St, Pune",
          vehicleMake: "Honda",
          vehicleModel: "City",
          vehicleYear: 2020,
          vehicleColor: "White",
          lastServiceDate: "2024-12-15",
          totalServices: 8,
          totalSpent: "₹45,000",
          currentStatus: "Active Job Card",
          activeJobCardId: "JC-2025-001",
          nextServiceDate: "2025-02-15",
        },
        {
          id: 3,
          customerId: 1,
          customerNumber: "CUST-2025-001",
          phone: "9876543210",
          registration: "PB10CD5678",
          vin: "MH12AB3456CD7892",
          customerName: "Rajesh Kumar",
          customerEmail: "rajesh@example.com",
          customerAddress: "123 Main St, Pune",
          vehicleMake: "Maruti",
          vehicleModel: "Swift",
          vehicleYear: 2018,
          vehicleColor: "Silver",
          lastServiceDate: "2024-11-10",
          totalServices: 3,
          totalSpent: "₹12,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
      ],
    },
    {
      id: 2,
      customerNumber: "CUST-2025-002",
      name: "Priya Sharma",
      phone: "9876543211",
      email: "priya@example.com",
      address: "456 Park Ave, Mumbai, Maharashtra",
      createdAt: "2024-02-20",
      totalVehicles: 1,
      totalSpent: "₹28,000",
      lastServiceDate: "2024-11-20",
      vehicles: [
        {
          id: 2,
          customerId: 2,
          customerNumber: "CUST-2025-002",
          phone: "9876543211",
          registration: "MH01XY5678",
          vin: "MH12AB3456CD7891",
          customerName: "Priya Sharma",
          customerEmail: "priya@example.com",
          customerAddress: "456 Park Ave, Mumbai",
          vehicleMake: "Maruti",
          vehicleModel: "Swift",
          vehicleYear: 2019,
          vehicleColor: "Red",
          lastServiceDate: "2024-11-20",
          totalServices: 5,
          totalSpent: "₹28,000",
          currentStatus: "Available",
          activeJobCardId: null,
          nextServiceDate: "2025-01-20",
        },
      ],
    },
    {
      id: 3,
      customerNumber: "CUST-2025-003",
      name: "Amit Patel",
      phone: "9876543212",
      email: "amit.patel@example.com",
      address: "789 MG Road, Koramangala, Bangalore, Karnataka",
      createdAt: "2024-03-10",
      totalVehicles: 1,
      totalSpent: "₹15,000",
      lastServiceDate: "2024-12-10",
      vehicles: [
        {
          id: 4,
          customerId: 3,
          customerNumber: "CUST-2025-003",
          phone: "9876543212",
          registration: "DL05CD9012",
          vin: "DL12AB3456CD7893",
          customerName: "Amit Patel",
          customerEmail: "amit.patel@example.com",
          customerAddress: "789 MG Road, Bangalore",
          vehicleMake: "Hyundai",
          vehicleModel: "i20",
          vehicleYear: 2021,
          vehicleColor: "Blue",
          lastServiceDate: "2024-12-10",
          totalServices: 3,
          totalSpent: "₹15,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
      ],
    },
    {
      id: 4,
      customerNumber: "CUST-2025-004",
      name: "Sneha Reddy",
      phone: "9876543213",
      email: "sneha.reddy@example.com",
      address: "321 Jubilee Hills, Hyderabad, Telangana",
      createdAt: "2024-04-05",
      totalVehicles: 2,
      totalSpent: "₹35,000",
      lastServiceDate: "2024-11-25",
      vehicles: [
        {
          id: 5,
          customerId: 4,
          customerNumber: "CUST-2025-004",
          phone: "9876543213",
          registration: "TS09EF3456",
          vin: "TS12AB3456CD7894",
          customerName: "Sneha Reddy",
          customerEmail: "sneha.reddy@example.com",
          customerAddress: "321 Jubilee Hills, Hyderabad",
          vehicleMake: "Tata",
          vehicleModel: "Nexon",
          vehicleYear: 2022,
          vehicleColor: "Black",
          lastServiceDate: "2024-11-25",
          totalServices: 4,
          totalSpent: "₹20,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
        {
          id: 6,
          customerId: 4,
          customerNumber: "CUST-2025-004",
          phone: "9876543213",
          registration: "TS09GH7890",
          vin: "TS12AB3456CD7895",
          customerName: "Sneha Reddy",
          customerEmail: "sneha.reddy@example.com",
          customerAddress: "321 Jubilee Hills, Hyderabad",
          vehicleMake: "Mahindra",
          vehicleModel: "XUV300",
          vehicleYear: 2020,
          vehicleColor: "White",
          lastServiceDate: "2024-10-15",
          totalServices: 3,
          totalSpent: "₹15,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
      ],
    },
    {
      id: 5,
      customerNumber: "CUST-2025-005",
      name: "Vikram Singh",
      phone: "9876543214",
      email: "vikram.singh@example.com",
      address: "654 Sector 18, Noida, Uttar Pradesh",
      createdAt: "2024-05-12",
      totalVehicles: 1,
      totalSpent: "₹22,000",
      lastServiceDate: "2024-12-05",
      vehicles: [
        {
          id: 7,
          customerId: 5,
          customerNumber: "CUST-2025-005",
          phone: "9876543214",
          registration: "UP16IJ1234",
          vin: "UP12AB3456CD7896",
          customerName: "Vikram Singh",
          customerEmail: "vikram.singh@example.com",
          customerAddress: "654 Sector 18, Noida",
          vehicleMake: "Toyota",
          vehicleModel: "Innova",
          vehicleYear: 2019,
          vehicleColor: "Silver",
          lastServiceDate: "2024-12-05",
          totalServices: 6,
          totalSpent: "₹22,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
      ],
    },
    {
      id: 6,
      customerNumber: "CUST-2025-006",
      name: "Anjali Mehta",
      phone: "9876543215",
      email: "anjali.mehta@example.com",
      address: "987 Salt Lake City, Kolkata, West Bengal",
      createdAt: "2024-06-20",
      totalVehicles: 1,
      totalSpent: "₹18,000",
      lastServiceDate: "2024-11-30",
      vehicles: [
        {
          id: 8,
          customerId: 6,
          customerNumber: "CUST-2025-006",
          phone: "9876543215",
          registration: "WB01KL5678",
          vin: "WB12AB3456CD7897",
          customerName: "Anjali Mehta",
          customerEmail: "anjali.mehta@example.com",
          customerAddress: "987 Salt Lake City, Kolkata",
          vehicleMake: "Maruti",
          vehicleModel: "Baleno",
          vehicleYear: 2021,
          vehicleColor: "Red",
          lastServiceDate: "2024-11-30",
          totalServices: 4,
          totalSpent: "₹18,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
      ],
    },
    {
      id: 7,
      customerNumber: "CUST-2025-007",
      name: "Rahul Desai",
      phone: "9876543216",
      email: "rahul.desai@example.com",
      address: "147 Viman Nagar, Pune, Maharashtra",
      createdAt: "2024-07-15",
      totalVehicles: 3,
      totalSpent: "₹65,000",
      lastServiceDate: "2024-12-20",
      vehicles: [
        {
          id: 9,
          customerId: 7,
          customerNumber: "CUST-2025-007",
          phone: "9876543216",
          registration: "MH12MN9012",
          vin: "MH12AB3456CD7898",
          customerName: "Rahul Desai",
          customerEmail: "rahul.desai@example.com",
          customerAddress: "147 Viman Nagar, Pune",
          vehicleMake: "Honda",
          vehicleModel: "Amaze",
          vehicleYear: 2020,
          vehicleColor: "White",
          lastServiceDate: "2024-12-20",
          totalServices: 5,
          totalSpent: "₹25,000",
          currentStatus: "Active Job Card",
          activeJobCardId: "JC-2025-002",
        },
        {
          id: 10,
          customerId: 7,
          customerNumber: "CUST-2025-007",
          phone: "9876543216",
          registration: "MH12OP3456",
          vin: "MH12AB3456CD7899",
          customerName: "Rahul Desai",
          customerEmail: "rahul.desai@example.com",
          customerAddress: "147 Viman Nagar, Pune",
          vehicleMake: "Ford",
          vehicleModel: "EcoSport",
          vehicleYear: 2019,
          vehicleColor: "Blue",
          lastServiceDate: "2024-11-15",
          totalServices: 3,
          totalSpent: "₹20,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
        {
          id: 11,
          customerId: 7,
          customerNumber: "CUST-2025-007",
          phone: "9876543216",
          registration: "MH12QR7890",
          vin: "MH12AB3456CD7900",
          customerName: "Rahul Desai",
          customerEmail: "rahul.desai@example.com",
          customerAddress: "147 Viman Nagar, Pune",
          vehicleMake: "Kia",
          vehicleModel: "Seltos",
          vehicleYear: 2022,
          vehicleColor: "Black",
          lastServiceDate: "2024-10-10",
          totalServices: 4,
          totalSpent: "₹20,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
      ],
    },
    {
      id: 8,
      customerNumber: "CUST-2025-008",
      name: "Kavita Nair",
      phone: "9876543217",
      email: "kavita.nair@example.com",
      address: "258 Banjara Hills, Hyderabad, Telangana",
      createdAt: "2024-08-08",
      totalVehicles: 1,
      totalSpent: "₹12,000",
      lastServiceDate: "2024-12-01",
      vehicles: [
        {
          id: 12,
          customerId: 8,
          customerNumber: "CUST-2025-008",
          phone: "9876543217",
          registration: "TS09ST1234",
          vin: "TS12AB3456CD7901",
          customerName: "Kavita Nair",
          customerEmail: "kavita.nair@example.com",
          customerAddress: "258 Banjara Hills, Hyderabad",
          vehicleMake: "Hyundai",
          vehicleModel: "Creta",
          vehicleYear: 2021,
          vehicleColor: "Silver",
          lastServiceDate: "2024-12-01",
          totalServices: 2,
          totalSpent: "₹12,000",
          currentStatus: "Available",
          activeJobCardId: null,
        },
      ],
    },
  ];

  // Filter suggestions based on search query
  const getSuggestions = (query: string): CustomerWithVehicles[] => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    let searchValue = query.trim();
    
    // Normalize search value based on type
    if (searchType === "phone") {
      searchValue = searchValue.replace(/[\s-+]/g, "").replace(/^91/, "");
    } else if (searchType === "customerNumber") {
      searchValue = searchValue.toUpperCase().replace(/\s+/g, "");
    }

    const filtered = mockCustomers.filter((customer) => {
      if (searchType === "phone") {
        return customer.phone.includes(searchValue);
      } else if (searchType === "name") {
        return customer.name.toLowerCase().includes(searchValue.toLowerCase());
      } else if (searchType === "customerNumber") {
        return customer.customerNumber.toUpperCase().includes(searchValue);
      } else if (searchType === "email") {
        return customer.email?.toLowerCase().includes(searchValue.toLowerCase());
      }
      return false;
    });

    return filtered.slice(0, 5); // Limit to 5 suggestions
  };

  // Handle input change with autocomplete
  const handleInputChange = (value: string): void => {
    setSearchQuery(value);
    setValidationError("");
    
    if (value.trim().length >= 2) {
      const filtered = getSuggestions(value);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && isInputFocused);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (customer: CustomerWithVehicles): void => {
    setSearchQuery(
      searchType === "phone"
        ? customer.phone
        : searchType === "name"
        ? customer.name
        : searchType === "customerNumber"
        ? customer.customerNumber
        : customer.email || ""
    );
    setSearchResults(customer);
    setSuggestions([]);
    setShowSuggestions(false);
    setShowCreateCustomer(false);
  };

  const validateSearchInput = (): boolean => {
    setValidationError("");

    if (!searchQuery.trim()) {
      setValidationError("Please enter a search query");
      return false;
    }

    if (searchType === "phone") {
      const cleaned = searchQuery.replace(/[\s-+]/g, "").replace(/^91/, "");
      if (cleaned.length !== 10 || !/^\d{10}$/.test(cleaned)) {
        setValidationError("Please enter a valid 10-digit phone number");
        return false;
      }
    } else if (searchType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(searchQuery)) {
        setValidationError("Please enter a valid email address");
        return false;
      }
    }

    return true;
  };

  const handleSearch = (): void => {
    if (!validateSearchInput()) {
      return;
    }

    setLoading(true);
    setSearchResults(null);
    setShowCreateCustomer(false);
    setShowSuggestions(false);

    // Normalize search value
    let searchValue = searchQuery.trim();
    if (searchType === "phone") {
      searchValue = searchValue.replace(/[\s-+]/g, "").replace(/^91/, "");
    } else if (searchType === "customerNumber") {
      // Normalize customer number search - convert to uppercase and remove extra spaces
      searchValue = searchValue.toUpperCase().replace(/\s+/g, "");
    }

    // Mock search logic - replace with API call
    setTimeout(() => {
      let found: CustomerWithVehicles | undefined = undefined;

      if (searchType === "phone") {
        found = mockCustomers.find((c) => c.phone.includes(searchValue));
      } else if (searchType === "name") {
        found = mockCustomers.find((c) =>
          c.name.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else if (searchType === "customerNumber") {
        found = mockCustomers.find((c) =>
          c.customerNumber.toUpperCase().includes(searchValue.toUpperCase())
        );
      } else if (searchType === "email") {
        found = mockCustomers.find((c) =>
          c.email?.toLowerCase().includes(searchValue.toLowerCase())
        );
      }

      if (found) {
        setSearchResults(found);
        setShowCreateCustomer(false);
      } else {
        setSearchResults(null);
        setShowCreateCustomer(true);
      }
      setLoading(false);
    }, 500);
  };

  const handleCreateCustomer = (): void => {
    setShowCreateForm(true);
    // Pre-fill form with search query if applicable
    if (searchType === "phone") {
      setNewCustomerForm((prev) => ({
        ...prev,
        phone: searchQuery.replace(/[\s-+]/g, "").replace(/^91/, ""),
      }));
    } else if (searchType === "email") {
      setNewCustomerForm((prev) => ({
        ...prev,
        email: searchQuery.trim(),
      }));
    } else if (searchType === "name") {
      setNewCustomerForm((prev) => ({
        ...prev,
        name: searchQuery.trim(),
      }));
    }
  };

  const generateCustomerNumber = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `CUST-${year}-${random}`;
  };

  const handleSaveNewCustomer = (): void => {
    // Validate form
    if (!newCustomerForm.name || !newCustomerForm.phone) {
      setValidationError("Name and Phone are required fields");
      return;
    }

    // Validate phone
    const cleanedPhone = newCustomerForm.phone.replace(/[\s-+]/g, "").replace(/^91/, "");
    if (cleanedPhone.length !== 10 || !/^\d{10}$/.test(cleanedPhone)) {
      setValidationError("Please enter a valid 10-digit phone number");
      return;
    }

    // Validate email if provided
    if (newCustomerForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newCustomerForm.email)) {
        setValidationError("Please enter a valid email address");
        return;
      }
    }

    setValidationError("");
    setLoading(true);

    // Mock API call - replace with actual API
    setTimeout(() => {
      const newCustomer: CustomerWithVehicles = {
        id: mockCustomers.length + 1,
        customerNumber: generateCustomerNumber(),
        name: newCustomerForm.name,
        phone: cleanedPhone,
        email: newCustomerForm.email || undefined,
        address: newCustomerForm.address || undefined,
        createdAt: new Date().toISOString().split("T")[0],
        totalVehicles: 0,
        totalSpent: "₹0",
        vehicles: [],
      };

      // In real app, save to backend and then update state
      setSearchResults(newCustomer);
      setShowCreateForm(false);
      setShowCreateCustomer(false);
      setLoading(false);

      // Reset form
      setNewCustomerForm({
        name: "",
        phone: "",
        email: "",
        address: "",
      });

      alert(`Customer created successfully! Customer Number: ${newCustomer.customerNumber}`);
    }, 500);
  };

  return (
    <div className="bg-[#f9f9fb] min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
            Customer Find
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Search for existing customers or create a new customer ID
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(["phone", "name", "customerNumber", "email"] as CustomerSearchType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSearchType(type);
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setSearchResults(null);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                      searchType === type
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type === "phone" && "Phone"}
                    {type === "name" && "Name"}
                    {type === "customerNumber" && "Customer #"}
                    {type === "email" && "Email"}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                  setIsInputFocused(true);
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => {
                    setIsInputFocused(false);
                    setShowSuggestions(false);
                  }, 200);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    if (suggestions.length === 1) {
                      handleSuggestionSelect(suggestions[0]);
                    } else {
                      handleSearch();
                    }
                  }
                }}
                placeholder={
                  searchType === "phone"
                    ? "Enter 10-digit phone number"
                    : searchType === "name"
                    ? "Enter customer name"
                    : searchType === "customerNumber"
                    ? "Enter customer number (e.g., CUST-2025-001)"
                    : "Enter email address"
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {suggestions.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleSuggestionSelect(customer)}
                      className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="text-indigo-600 flex-shrink-0" size={16} />
                            <h4 className="font-semibold text-gray-800 truncate">{customer.name}</h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 ml-6">
                            <div className="flex items-center gap-1">
                              <Hash size={12} />
                              <span className="font-mono">{customer.customerNumber}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone size={12} />
                              <span>{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail size={12} />
                                <span className="truncate max-w-[150px]">{customer.email}</span>
                              </div>
                            )}
                          </div>
                          {customer.totalVehicles && customer.totalVehicles > 0 && (
                            <div className="flex items-center gap-1 ml-6 mt-1">
                              <Car size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {customer.totalVehicles} {customer.totalVehicles === 1 ? "vehicle" : "vehicles"}
                              </span>
                            </div>
                          )}
                        </div>
                        <CheckCircle className="text-indigo-600 flex-shrink-0" size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>

          {validationError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={18} />
              {validationError}
            </div>
          )}
        </div>

        {/* Customer Not Found - Create New */}
        {showCreateCustomer && !showCreateForm && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Not Found</h3>
              <p className="text-gray-600 mb-6">
                No customer found with the provided {searchType}. Would you like to create a new
                customer?
              </p>
              <button
                onClick={handleCreateCustomer}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
              >
                <PlusCircle size={20} />
                Create New Customer
              </button>
            </div>
          </div>
        )}

        {/* Create Customer Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Create New Customer</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setValidationError("");
                  setNewCustomerForm({
                    name: "",
                    phone: "",
                    email: "",
                    address: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomerForm.name}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newCustomerForm.phone}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
                  }
                  placeholder="10-digit phone number"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomerForm.email}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newCustomerForm.address}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, address: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setValidationError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewCustomer}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Results */}
        {searchResults && (
          <div className="space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <User className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{searchResults.name}</h2>
                    <p className="text-sm text-gray-600">Customer #{searchResults.customerNumber}</p>
                  </div>
                </div>
                <Link
                  href={`/sc/vehicle-search?customerId=${searchResults.id}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  Add Vehicle
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="text-gray-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-800">{searchResults.phone}</p>
                  </div>
                </div>
                {searchResults.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="text-gray-600" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-800">{searchResults.email}</p>
                    </div>
                  </div>
                )}
                {searchResults.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="text-gray-600" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {searchResults.address}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-gray-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(searchResults.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{searchResults.totalVehicles || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Vehicles</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{searchResults.totalSpent || "₹0"}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Spent</p>
                </div>
                {searchResults.lastServiceDate && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-bold text-purple-600">
                      {new Date(searchResults.lastServiceDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Last Service</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicles List */}
            {searchResults.vehicles && searchResults.vehicles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Car className="text-indigo-600" size={20} />
                  Linked Vehicles ({searchResults.vehicles.length})
                </h3>
                <div className="space-y-3">
                  {searchResults.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-800">
                              {vehicle.vehicleMake} {vehicle.vehicleModel} ({vehicle.vehicleYear})
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                vehicle.currentStatus === "Active Job Card"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {vehicle.currentStatus}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Registration</p>
                              <p className="font-medium text-gray-800">{vehicle.registration}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">VIN</p>
                              <p className="font-medium text-gray-800 font-mono text-xs">
                                {vehicle.vin}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Color</p>
                              <p className="font-medium text-gray-800">{vehicle.vehicleColor}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Services</p>
                              <p className="font-medium text-gray-800">
                                {vehicle.totalServices} ({vehicle.totalSpent})
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/sc/job-cards?vehicleId=${vehicle.id}`}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!searchResults.vehicles || searchResults.vehicles.length === 0) && (
              <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                <Car className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Vehicles Linked</h3>
                <p className="text-gray-600 mb-4">
                  This customer doesn't have any vehicles linked yet.
                </p>
                <Link
                  href={`/sc/vehicle-search?customerId=${searchResults.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  <PlusCircle size={20} />
                  Add First Vehicle
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

