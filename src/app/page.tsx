"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { UserInfo, UserRole } from "@/shared/types";
import { getRedirectPath } from "@/shared/constants/routes";
import { safeStorage } from "@/shared/lib/localStorage";
import { PageLoader } from "@/components/ui/PageLoader";

interface MockUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  initials: string;
  serviceCenter: string | null;
}

const users: MockUser[] = [
  {
    email: "admin@service.com",
    password: "admin123",
    role: "admin",
    name: "Rajesh Kumar Singh",
    initials: "RKS",
    serviceCenter: null,
  },
  {
    email: "scmanager@service.com",
    password: "sc123",
    role: "sc_manager",
    name: "SC Manager",
    initials: "SCM",
    serviceCenter: "Pune Phase 1",
  },
  {
    email: "scstaff@service.com",
    password: "staff123",
    role: "sc_staff",
    name: "SC Staff",
    initials: "SCS",
    serviceCenter: "Pune Phase 1",
  },
  {
    email: "engineer@service.com",
    password: "eng123",
    role: "service_engineer",
    name: "Service Engineer",
    initials: "SE",
    serviceCenter: "Pune Phase 1",
  },
  {
    email: "advisor@service.com",
    password: "adv123",
    role: "service_advisor",
    name: "Service Advisor",
    initials: "SA",
    serviceCenter: "Pune Phase 1",
  },
  {
    email: "callcenter@service.com",
    password: "cc123",
    role: "call_center",
    name: "Call Center Staff",
    initials: "CC",
    serviceCenter: null, // Call center can assign to any service center
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [selectedRole, setSelectedRole] = useState<MockUser | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const roleSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleSelectorRef.current &&
        !roleSelectorRef.current.contains(event.target as Node)
      ) {
        setShowRoleSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    const user = users.find(
      (u) => u.email === email.toLowerCase() && u.password === password
    );

    if (user) {
      setIsLoading(true);
      
      const userInfo: UserInfo = {
        email: user.email,
        name: user.name,
        role: user.role,
        initials: user.initials,
        serviceCenter: user.serviceCenter,
      };

      safeStorage.setItem("userRole", user.role);
      safeStorage.setItem("userInfo", userInfo);
      safeStorage.setItem("isLoggedIn", "true");

      // Simulate a brief loading period for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    } else {
      setError("Invalid email or password");
    }
  };

  const quickLogin = (role: UserRole) => {
    const user = users.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
      setSelectedRole(user);
      setShowRoleSelector(false);
    }
  };

  if (isLoading) {
    return <PageLoader message="Signing you in..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E5E9F2] via-[#C7D2FE] to-[#EEF2FF] text-gray-900 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-[#3B82F6]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#2563EB]/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-10 text-center border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] blur-xl rounded-2xl opacity-40"></div>
            <div className="relative bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] p-5 rounded-2xl shadow-md flex items-center justify-center">
              <Building2 size={40} strokeWidth={2.2} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-1">Login</h1>
        <p className="text-gray-500 mb-4">Service Center Management System</p>

        <div className="relative mb-4" ref={roleSelectorRef}>
          <button
            type="button"
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
          >
            <span className="flex items-center gap-2">
              <User size={16} />
              {selectedRole
                ? `Login as ${selectedRole.name}`
                : "Quick Login (Select Role)"}
            </span>
            <ChevronDown size={16} />
          </button>

          {showRoleSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <p className="text-xs text-gray-500 px-2 py-1 mb-1">Admin</p>
                <button
                  onClick={() => quickLogin("admin")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  admin@service.com
                </button>

                <p className="text-xs text-gray-500 px-2 py-1 mt-2 mb-1">
                  Service Center Roles
                </p>
                <button
                  onClick={() => quickLogin("sc_manager")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  SC Manager
                </button>
                <button
                  onClick={() => quickLogin("sc_staff")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  SC Staff
                </button>
                <button
                  onClick={() => quickLogin("service_engineer")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Service Engineer
                </button>
                <button
                  onClick={() => quickLogin("service_advisor")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Service Advisor
                </button>
                <button
                  onClick={() => quickLogin("call_center")}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Call Center
                </button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-[#3B82F6]"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[#3B82F6] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all font-semibold shadow-sm"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <p className="text-xs font-semibold text-blue-800 mb-2">
            Demo Credentials:
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <p>
              <strong>Admin:</strong> admin@service.com / admin123
            </p>
            <p>
              <strong>SC Manager:</strong> scmanager@service.com / sc123
            </p>
            <p>
              <strong>SC Staff:</strong> scstaff@service.com / staff123
            </p>
            <p>
              <strong>Engineer:</strong> engineer@service.com / eng123
            </p>
            <p>
              <strong>Advisor:</strong> advisor@service.com / adv123
            </p>
            <p>
              <strong>Call Center:</strong> callcenter@service.com / cc123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

