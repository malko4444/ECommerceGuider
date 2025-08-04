// import SideBar from "./component/SideBar";
import { CgProfile } from "react-icons/cg";
import Sidebar from "./component/SideBar";
import HeroSection from "./component/HeroSection";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar/>
      
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide">
  Welcome to{" "}
  <span className="text-teal-700 italic font-black">
    ECommerce Guider
  </span>
</h1>

          <div className="flex items-center px-4 py-2 bg-[#a9e0dd] rounded-lg cursor-pointer hover:bg-gray-300 transition duration-200">
            <CgProfile className="text-2xl text-teal-800" />
            <p className="ms-2 text-teal-800 text-lg font-semibold">Profile</p>
          </div>
        </div>

        {/* Divider */}
        <div className="bg-teal-400 h-0.5 w-full mb-4"></div>

        {/* Main content can go here */}
        <div>
          <HeroSection/>
        </div>
      </div>
    </div>
  );
}










// import SideBar from "./component/SideBar";
// import { CgProfile } from "react-icons/cg";

// export default function Home() {
//   return (
//     <div className="flex">
//       <SideBar />
//       <div>
//         <div className="flex items-center justify-start rounded-lg mb-2">
//           <h1 className="text-2xl font-bold ">Welcome to ECommerce Guider</h1>
//         <div className="flex items-center justify-between p-2 rounded bg-[#93b6b4] hover:bg-gray-300 transition duration-200">
//           <CgProfile className="text-2xl text-teal-700" />
//           <p className="ms-1 text-teal-600 text-lg font-bold">Profile</p>
        
//         </div>
//         </div>
//         <div className="bg-teal-400 h-0.5 w-full"></div>
//       </div>
//     </div>
//   );
// }
