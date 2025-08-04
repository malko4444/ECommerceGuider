import React from 'react'
import Sidebar from '../component/SideBar'
import Budget from '../component/Budget'
import Topbar from '../component/Topbar'

function page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        <Topbar />

        {/* Main content */}
        <div>
          <Budget />
        </div>
      </div>
    </div>
  )
}

export default page;
