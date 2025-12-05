"use client";

import { useState } from "react";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import {
  Settings as SettingsIcon,
  Mail,
  MessageSquare,
  Shield,
  Key,
  Database,
  Bell,
  Globe,
  Lock,
  Server,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface Setting {
  key: string;
  value: string;
  category: string;
  description?: string;
}

type SettingCategory = "general" | "email" | "sms" | "security" | "notifications" | "integrations" | "billing";

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>("general");
  
  // Mock settings data (replace with API call)
  const defaultSettings: Record<string, Setting> = {
    "app.name": { key: "app.name", value: "DMS System", category: "general", description: "Application Name" },
    "app.timezone": { key: "app.timezone", value: "Asia/Kolkata", category: "general", description: "Default Timezone" },
    "app.currency": { key: "app.currency", value: "INR", category: "general", description: "Default Currency" },
    "email.host": { key: "email.host", value: "smtp.gmail.com", category: "email", description: "SMTP Host" },
    "email.port": { key: "email.port", value: "587", category: "email", description: "SMTP Port" },
    "email.from": { key: "email.from", value: "noreply@dms.com", category: "email", description: "From Email Address" },
    "sms.provider": { key: "sms.provider", value: "twilio", category: "sms", description: "SMS Provider" },
    "sms.api_key": { key: "sms.api_key", value: "****", category: "sms", description: "SMS API Key" },
    "security.mfa_enabled": { key: "security.mfa_enabled", value: "false", category: "security", description: "Enable MFA" },
    "security.password_min_length": { key: "security.password_min_length", value: "8", category: "security", description: "Minimum Password Length" },
    "security.password_require_uppercase": { key: "security.password_require_uppercase", value: "true", category: "security", description: "Require Uppercase" },
    "security.password_require_numbers": { key: "security.password_require_numbers", value: "true", category: "security", description: "Require Numbers" },
    "security.session_timeout": { key: "security.session_timeout", value: "3600", category: "security", description: "Session Timeout (seconds)" },
    "notifications.email_enabled": { key: "notifications.email_enabled", value: "true", category: "notifications", description: "Enable Email Notifications" },
    "notifications.sms_enabled": { key: "notifications.sms_enabled", value: "false", category: "notifications", description: "Enable SMS Notifications" },
    "integrations.api_key": { key: "integrations.api_key", value: "****", category: "integrations", description: "API Key" },
    "billing.plan": { key: "billing.plan", value: "enterprise", category: "billing", description: "Subscription Plan" },
  };

  // Use lazy initialization to load settings from localStorage
  const [settings, setSettings] = useState<Record<string, Setting>>(() => {
    const storedSettings = safeStorage.getItem<Record<string, { key: string; value: string; category: string; description: string }> | null>("systemSettings", null);
    return storedSettings || defaultSettings;
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const categories = [
    { id: "general" as SettingCategory, label: "General", icon: Globe },
    { id: "email" as SettingCategory, label: "Email", icon: Mail },
    { id: "sms" as SettingCategory, label: "SMS", icon: MessageSquare },
    { id: "security" as SettingCategory, label: "Security", icon: Shield },
    { id: "notifications" as SettingCategory, label: "Notifications", icon: Bell },
    { id: "integrations" as SettingCategory, label: "Integrations", icon: Server },
    { id: "billing" as SettingCategory, label: "Billing", icon: Database },
  ];

  const getCategorySettings = () => {
    return Object.values(settings).filter((s) => s.category === activeCategory);
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      [key]: { ...settings[key], value },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    // TODO: Replace with API call
    safeStorage.setItem("systemSettings", settings);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleTestEmail = () => {
    alert("Test email sent! Check your inbox.");
  };

  const handleTestSMS = () => {
    alert("Test SMS sent!");
  };

  const handleToggleMaintenance = () => {
    const newMode = !maintenanceMode;
    setMaintenanceMode(newMode);
    alert(`Maintenance mode ${newMode ? "enabled" : "disabled"}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">System Settings</h1>
        <p className="text-gray-600">Configure application settings and preferences</p>
      </div>

      {/* Maintenance Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600" size={24} />
            <div>
              <h3 className="font-semibold text-gray-800">Maintenance Mode</h3>
              <p className="text-sm text-gray-600">Enable to put the system in maintenance mode</p>
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              maintenanceMode
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {maintenanceMode ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Categories</h2>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      activeCategory === category.id
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {categories.find((c) => c.id === activeCategory)?.label} Settings
              </h2>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle size={16} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {getCategorySettings().map((setting) => (
                <div key={setting.key} className="border-b border-gray-200 pb-4 last:border-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {setting.description || setting.key}
                  </label>
                  {setting.key.includes("password") || setting.key.includes("api_key") || setting.key.includes("key") ? (
                    <input
                      type="password"
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Enter value"
                    />
                  ) : setting.key.includes("enabled") || setting.key.includes("require") ? (
                    <select
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Enter value"
                    />
                  )}
                </div>
              ))}

              {/* Category-specific actions */}
              {activeCategory === "email" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleTestEmail}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Send Test Email
                  </button>
                </div>
              )}

              {activeCategory === "sms" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleTestSMS}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Send Test SMS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

