import React from 'react'
import { CgProfile } from "react-icons/cg";
import Sidebar from '../component/SideBar'
import TrendingProducts from '../component/trendingProducts'
import Topbar from '../component/TopBar';

function page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        <Topbar/>
        <div>
          <TrendingProducts/>

        </div>
      </div>
    </div>
  )
}

export default page