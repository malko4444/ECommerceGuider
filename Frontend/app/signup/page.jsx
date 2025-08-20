"use client";
import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope, FaCalendarAlt, FaVenusMars, FaKey, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import Link from "next/link";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signupUser = async () => {
    const { name, email, password, gender, dob, otp } = formData;

    if (!name || !email || !password || !gender || !dob || !otp) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:4000/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ Signup successful! Redirecting...");
        console.log("Signed up:", data);
        setTimeout(() => {
          window.location.href = "/home";
        }, 1500);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("⚠️ Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-12 max-w-md mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaUserPlus className="text-teal-600" />
        Signup
      </h2>

      {/* Full Name */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-4">
        <FaUser className="text-gray-400 mr-3" />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full outline-none"
        />
      </div>

      {/* Email */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-4">
        <FaEnvelope className="text-gray-400 mr-3" />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full outline-none"
        />
      </div>

      {/* Password */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-4">
        <FaLock className="text-gray-400 mr-3" />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full outline-none"
        />
      </div>

      {/* Gender */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-4">
        <FaVenusMars className="text-gray-400 mr-3" />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full outline-none bg-transparent"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Date of Birth */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-4">
        <FaCalendarAlt className="text-gray-400 mr-3" />
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          className="w-full outline-none"
        />
      </div>

      {/* OTP */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-6">
        <FaKey className="text-gray-400 mr-3" />
        <input
          type="text"
          name="otp"
          placeholder="Enter OTP"
          value={formData.otp}
          onChange={handleChange}
          className="w-full outline-none"
        />
      </div>

      <button
        onClick={signupUser}
        disabled={loading}
        className="bg-teal-600 text-white w-full py-3 rounded-full hover:bg-teal-700 transition flex justify-center items-center gap-2"
      >
        {loading ? "Signing up..." : <> <FaUserPlus /> Signup </>}
      </button>

      {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}
      {success && <p className="text-green-600 font-semibold mt-4">{success}</p>}

      {/* Link to Login */}
      <p className="text-center text-gray-600 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-teal-600 font-semibold hover:underline flex items-center justify-center gap-1"
        >
          <FaSignInAlt /> Login
        </Link>
      </p>
    </section>
  );
}
