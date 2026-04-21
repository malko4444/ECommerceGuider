'use client';
import React from "react";
import Sidebar from "../component/SideBar";
import Topbar from "../component/Topbar";
import Admin from "../component/Admin";

function page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        <Topbar />

        {/* Main content */}
        <div>
         <Admin />
        </div>
      </div>
    </div>
  )
}

export default page;