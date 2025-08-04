import React from 'react'
import { CgProfile } from "react-icons/cg";
import Sidebar from '../component/SideBar'
import RoadMap from '../component/RoadMap';
import Topbar from '../component/Topbar';

function page() {
  return (
<div className="flex h-screen overflow-hidden">
      <Sidebar/>
      
      <div className="flex-1 p-6 overflow-auto">
        <Topbar/>
        <div>
          <RoadMap/>
        </div>
      </div>
    </div>
   )
}

export default page