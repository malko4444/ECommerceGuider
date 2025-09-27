"use client";
import React, { useState } from "react";
import {
  FaUser, FaLock, FaEnvelope, FaCalendarAlt, FaVenusMars,
  FaKey, FaUserPlus, FaSignInAlt
} from "react-icons/fa";
import Link from "next/link";
import OtpInput from "../component/OtpInput";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
    otp: "",
  });

  const [step, setStep] = useState(1); // 1 = fill details, 2 = enter OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Generate OTP
  const sendOtp = async () => {
    const { name, email, password, gender, dob } = formData;

    if (!name || !email || !password || !gender || !dob) {
      setError("⚠️ All fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:4000/auth/otpGenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        // Save user details in localStorage for later signup
        localStorage.setItem("signupData", JSON.stringify({ name, email, password, gender, dob }));
        setSuccess("✅ OTP sent to your email.");
        setStep(2); // show OTP input
      } else {
        const data = await res.json();
        setError(data.error || "❌ Failed to send OTP.");
      }
    } catch (err) {
      setError("⚠️ Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Signup
  const verifyOtpAndSignup = async () => {
    if (!formData.otp) {
      setError("⚠️ Please enter the OTP.");
      return;
    }

    const savedData = JSON.parse(localStorage.getItem("signupData"));
    if (!savedData) {
      setError("⚠️ No signup data found, please try again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:4000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...savedData, otp: formData.otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("🎉 Signup successful! Redirecting...");
        localStorage.removeItem("signupData"); // cleanup
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        setError(data.error || "❌ Signup failed.");
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

      {step === 1 && (
        <>
          {/* Full Name */}
          <div className="flex items-center border rounded-full px-4 py-2 mb-4">
            <FaUser className="text-gray-400 mr-3" />
            <input type="text" name="name" placeholder="Full Name"
              value={formData.name} onChange={handleChange}
              className="w-full outline-none" />
          </div>

          {/* Email */}
          <div className="flex items-center border rounded-full px-4 py-2 mb-4">
            <FaEnvelope className="text-gray-400 mr-3" />
            <input type="email" name="email" placeholder="Email Address"
              value={formData.email} onChange={handleChange}
              className="w-full outline-none" />
          </div>

          {/* Password */}
          <div className="flex items-center border rounded-full px-4 py-2 mb-4">
            <FaLock className="text-gray-400 mr-3" />
            <input type="password" name="password" placeholder="Password"
              value={formData.password} onChange={handleChange}
              className="w-full outline-none" />
          </div>

          {/* Gender */}
          <div className="flex items-center border rounded-full px-4 py-2 mb-4">
            <FaVenusMars className="text-gray-400 mr-3" />
            <select name="gender" value={formData.gender} onChange={handleChange}
              className="w-full outline-none bg-transparent">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* DOB */}
          <div className="flex items-center border rounded-full px-4 py-2 mb-4">
            <FaCalendarAlt className="text-gray-400 mr-3" />
            <input type="date" name="dob"
              value={formData.dob} onChange={handleChange}
              className="w-full outline-none" />
          </div>

          <button onClick={sendOtp} disabled={loading}
            className="bg-teal-600 text-white w-full py-3 rounded-full hover:bg-teal-700 transition flex justify-center items-center gap-2">
            {loading ? "Sending OTP..." : <> <FaKey /> Send OTP </>}
          </button>
        </>
      )}

      {step === 2 && (
  <>
    <OtpInput otp={formData.otp || ""} setOtp={(val) => setFormData({ ...formData, otp: val })} />

    <button
      onClick={verifyOtpAndSignup}
      disabled={loading}
      className="bg-teal-600 text-white w-full py-3 rounded-full hover:bg-teal-700 transition flex justify-center items-center gap-2 shadow-md"
    >
      {loading ? "Verifying..." : <> <FaUserPlus /> Verify & Signup </>}
    </button>
  </>
)}

      {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}
      {success && <p className="text-teal-600 font-semibold mt-4">{success}</p>}

      {step === 1 && (
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login"
            className="text-teal-600 font-semibold hover:underline flex items-center justify-center gap-1">
            <FaSignInAlt /> Login
          </Link>
        </p>
      )}
    </section>
  );
}
