"use client";
import React, { useState } from "react";
import { FaEnvelope, FaKey, FaPaperPlane } from "react-icons/fa";

export default function OtpGeneratePage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateOtp = async () => {
    if (!email) {
      setError("⚠️ Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setOtp(null);

    try {
      const res = await fetch("http://localhost:4000/users/otpGenerate", {
        method: "POST", // ✅ must be POST (your backend was GET but using req.body → switch to POST)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ OTP sent to your email.");
        setOtp(data.otp); // for debugging / dev only
      } else {
        setError(data.error || "❌ Failed to send OTP.");
      }
    } catch (err) {
      setError("⚠️ Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-12 max-w-md mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaKey className="text-teal-600" />
        Generate OTP
      </h2>

      {/* Email Input */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-6">
        <FaEnvelope className="text-gray-400 mr-3" />
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      <button
        onClick={generateOtp}
        disabled={loading}
        className="bg-teal-600 text-white w-full py-3 rounded-full hover:bg-teal-700 transition flex justify-center items-center gap-2"
      >
        {loading ? "Sending OTP..." : <> <FaPaperPlane /> Send OTP </>}
      </button>

      {/* Messages */}
      {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}
      {success && <p className="text-green-600 font-semibold mt-4">{success}</p>}

      {/* Debugging: show OTP on screen (remove in production) */}
      {otp && (
        <p className="mt-4 text-gray-700 text-center">
          <strong>OTP (for testing):</strong> {otp}
        </p>
      )}
    </section>
  );
}
