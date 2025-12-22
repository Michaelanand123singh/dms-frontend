"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, ChevronDown } from "lucide-react";
import Link from "next/link";
import { authService } from "@/core/auth/auth.service";
import { getRedirectPath } from "@/shared/constants/routes";
import { TopLoadingBar } from "@/components/ui/TopLoadingBar";
import { TEST_CREDENTIALS } from "@/utils/quick-login";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login({
        email: email.toLowerCase(),
        password,
      });

      // Redirect to appropriate dashboard based on user role
      const redirectPath = getRedirectPath(result.user.role);
      router.push(redirectPath);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
      setIsLoading(false);
    }
  };

  const quickFillCredentials = (role: keyof typeof TEST_CREDENTIALS) => {
    const credentials = TEST_CREDENTIALS[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <>
      <TopLoadingBar isLoading={isLoading} />
      <div className="min-h-screen flex bg-gray-50">
        {/* Left Side - Branding Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 relative overflow-hidden">
          {/* Animated Circles */}
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center px-12 text-white">
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-xl">
                <Image
                  src="/42ev.png"
                  alt="42 EV Tech & Services"
                  width={240}
                  height={100}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-center">Welcome Back</h1>
            <p className="text-xl text-indigo-100 text-center max-w-md mb-8">
              Sign in to access your Service Center Management System
            </p>
            <div className="w-full max-w-md space-y-3">
              <div className="flex items-center gap-3 text-indigo-100">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Secure & Reliable Platform</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Manage Your Service Operations</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Real-time Dashboard & Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <Image
                  src="/42ev.png"
                  alt="42 EV Tech & Services"
                  width={160}
                  height={70}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Sign In</h2>
              <p className="text-gray-600 text-sm">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} strokeWidth={2} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} strokeWidth={2} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2.5 text-gray-700 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="font-medium group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className="text-red-600">⚠</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Test Credentials - Only in Development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mb-3">
                    <span>Test Credentials (Development Only)</span>
                    <ChevronDown size={16} className="transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 p-4 bg-indigo-50/50 border border-indigo-200/50 rounded-xl">
                    <div className="text-xs text-indigo-800 space-y-2">
                      {Object.entries(TEST_CREDENTIALS).map(([role, creds]) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => quickFillCredentials(role as keyof typeof TEST_CREDENTIALS)}
                          className="w-full text-left flex items-center justify-between py-2 px-3 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          <span className="font-semibold">{role.replace(/_/g, ' ')}:</span>
                          <span className="font-mono text-[10px]">{creds.email}</span>
                        </button>
                      ))}
                      <p className="text-[10px] text-indigo-600 mt-3 pt-3 border-t border-indigo-200">
                        Click a role to auto-fill credentials. Password: admin123
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
