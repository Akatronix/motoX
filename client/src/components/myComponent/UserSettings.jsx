import React, { useState } from "react";
import { User, Mail, Save } from "lucide-react";
import api from "@/services/api";
import { useUserDataStore } from "@/stores/userDataStore";
import { toast } from "sonner";

const COLORS = {
  bg: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  accent: "#10b981",
};

const UserSettings = () => {
  const { userData } = useUserDataStore();
  const [formData, setFormData] = useState({
    fullName: userData ? userData.username : "",
    email: userData ? userData.email : "",
  });

  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleformSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    const myformData = {
      username: formData.fullName,
      email: formData.email,
    };

    try {
      const response = await api.post("/user/updateUserInfo", myformData);

      if (response.status === 200) {
        setError("");
        setFormData({
          fullName: "",
          email: "",
        });
        toast.success("User information updated successfully");
      } else {
        toast.error("Failed to update user information");
      }
    } catch (err) {
      toast.error("Failed to update user information");
    }
  };

  return (
    <div
      className={`min-h-screen ${COLORS.bg} p-6 text-gray-100 font-sans selection:bg-blue-500/30 max-w-md`}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
          MotoX
          <span className="h-4 w-[1px] bg-gray-800" />
          <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            Account Settings
          </span>
        </h1>
        <p className="text-gray-600 text-[10px] font-bold uppercase mt-2 tracking-widest">
          Update your profile information
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleformSubmit}
        className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 space-y-5 shadow-2xl`}
      >
        {/* Full Name Field */}
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
              <User className="w-4 h-4" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                handleChange("fullName", e.target.value);
                setError("");
              }}
              className="w-full py-3 pl-11 pr-4 bg-[#0b0e14] border border-[#1f252e] rounded-xl text-white text-sm font-medium placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
              <Mail className="w-4 h-4" strokeWidth={2} />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                handleChange("email", e.target.value);
                setError("");
              }}
              className="w-full py-3 pl-11 pr-4 bg-[#0b0e14] border border-[#1f252e] rounded-xl text-white text-sm font-medium placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors"
              placeholder="Enter your email"
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all bg-[#10b981] hover:bg-[#10b981]/90 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] mt-2"
        >
          <Save className="w-4 h-4" strokeWidth={2.5} />
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UserSettings;
