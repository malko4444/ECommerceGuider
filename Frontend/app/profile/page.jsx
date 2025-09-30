"use client";
import React, { useEffect, useState } from "react";
import {
  FaVenusMars,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import Topbar from "../component/Topbar";
import Sidebar from "../component/SideBar";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:4000/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          setError(data.error || "Failed to fetch profile");
        }
      } catch (err) {
        setError("⚠️ Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Loading profile...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-6 font-semibold">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col p-6">
        {/* Topbar at the top */}
        <Topbar />

        {/* Profile Card Centered */}
        <div className="flex justify-center items-start flex-1 mt-6">
          <div className="relative w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Background cover */}
            <div
              className="h-32 bg-cover bg-center"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80")`,
              }}
            ></div>

            {/* Profile content */}
            <div className="p-6 relative">
              {/* Avatar */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-md">
                  <img
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="mt-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>

              {/* Details */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <FaVenusMars className="text-teal-600" />
                  <span>{user?.gender || "N/A"}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <FaCalendarAlt className="text-teal-600" />
                  <span>
                    {user?.dob ? new Date(user.dob).toDateString() : "N/A"}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="mt-6 w-full bg-teal-600 text-white py-3 rounded-full hover:bg-teal-700 transition flex justify-center items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
