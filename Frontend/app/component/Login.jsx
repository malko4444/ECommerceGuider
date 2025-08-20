"use client";
import React, { useState } from "react";
import { auth } from "../../config/firebase"; // ✅ Firebase config
import { signInWithEmailAndPassword } from "firebase/auth";
import { FaUser, FaLock, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loginUser = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setSuccess(`Login Succeessfully `);
      console.log("Logged in user:", user);
      localStorage.setItem("user", JSON.stringify(user)); // Save user data to localStorage
      

      // Redirect after login
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-md mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaSignInAlt className="text-teal-600" />
        Login
      </h2>

      {/* Email */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-4">
        <FaUser className="text-gray-400 mr-3" />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* Password */}
      <div className="flex items-center border rounded-full px-4 py-2 mb-6">
        <FaLock className="text-gray-400 mr-3" />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      <button
        onClick={loginUser}
        disabled={loading}
        className="bg-teal-600 text-white w-full py-3 rounded-full hover:bg-teal-700 transition flex justify-center items-center gap-2"
      >
        {loading ? "Logging in..." : <> <FaSignInAlt /> Login </>}
      </button>

      {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}
      {success && <p className="text-green-600 font-semibold mt-4">{success}</p>}

      {/* Link to Signup */}
      <p className="text-center text-gray-600 mt-6">
        Don’t have an account?{" "}
        <Link
          href="/otpGenerate"
          className="text-teal-600 font-semibold hover:underline flex items-center justify-center gap-1"
        >
          <FaUserPlus /> Signup
        </Link>
      </p>
    </section>
  );
}
