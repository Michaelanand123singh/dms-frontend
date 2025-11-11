"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      router.push("/dashboarda");
    } else {
      alert("Please enter valid credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E5E9F2] via-[#C7D2FE] to-[#EEF2FF] text-gray-900 relative overflow-hidden">
      {/* Soft gradient background circles */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-[#3B82F6]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#2563EB]/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Login card */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-10 text-center border border-gray-200">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] blur-xl rounded-2xl opacity-40"></div>
            <div className="relative bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] p-5 rounded-2xl shadow-md flex items-center justify-center">
              <Building2 size={40} strokeWidth={2.2} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-1">Admin Login</h1>
        <p className="text-gray-500 mb-8">Service Center Management System</p>

        {/* Form */}
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

          <button
            type="submit"
            className="w-full py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all font-semibold shadow-sm"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
