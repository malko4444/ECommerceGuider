// src/component/Topbar.jsx
import React from 'react';
import Link from '@bradgarropy/next-link';
import { CgProfile } from "react-icons/cg";

const Topbar = () => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide">
          Welcome to{" "}
          <span className="text-teal-700 italic font-black">
            ECommerce Guider
          </span>
        </h1>
         <Link to='/profile'>
        <div className="flex items-center px-4 py-2 bg-[#a9e0dd] rounded-lg cursor-pointer hover:bg-teal-600 transition duration-200 group">
         
          <CgProfile className="text-2xl text-teal-800 group-hover:text-white transition duration-200" />
          <p className="ms-2 text-teal-800 text-lg font-semibold group-hover:text-white transition duration-200">
            Profile
          </p>
        </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="bg-teal-400 h-0.5 w-full mb-4"></div>
    </>
  );
};

export default Topbar;
