import React from 'react'
import { FaCloudversify, FaHome, FaInfoCircle, FaPhone, FaServicestack, FaBlog } from "react-icons/fa";
import './font.css'; // Make sure your custom font is imported here

function SideBar() {
    return (
        <div className='flex'>
            {/* Sidebar */}
            <div className='flex flex-col items-start justify-start h-screen bg-teal-100 shadow-lg p-4 w-64 font-poppins'>

                {/* Header */}
                <div className='flex items-center justify-center p-2 rounded-lg mb-6'>
                    <FaCloudversify className='text-5xl text-teal-700' />
                    <h1 className='text-xl ms-2 font-bold text-teal-700 tracking-wide'>Ecommerce Guider</h1>
                </div>

                {/* Menu */}
                <div className='flex flex-col items-start justify-center gap-3 w-full'>
                    <MenuItem icon={<FaHome />} label="Home" />
                    <MenuItem icon={<FaInfoCircle />} label="About" />
                    <MenuItem icon={<FaPhone />} label="Contact" />
                    <MenuItem icon={<FaServicestack />} label="Services" />
                    <MenuItem icon={<FaBlog />} label="Blog" />
                </div>
            </div>

            {/* Vertical Black Line */}
            <div className="h-screen w-[1px] bg-teal-400"></div>
        </div>
    )
}

// Reusable Menu Item component
function MenuItem({ icon, label }) {
    return (
        <div className='flex items-center w-full p-3 cursor-pointer rounded-md hover:bg-gray-200 transition'>
            <div className='text-xl text-teal-700 me-3'>{icon}</div>
            <h1 className='text-[17px] font-medium text-gray-800 tracking-wide'>{label}</h1>
        </div>
    );
}

export default SideBar;
