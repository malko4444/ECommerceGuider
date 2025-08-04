'use client';
import Link from '@bradgarropy/next-link';
import { usePathname } from 'next/navigation';
import {
  FaRoad, FaMoneyBill, FaSearch, FaChartLine,
  FaUsers, FaLayerGroup, FaListUl , FaChalkboardTeacher, FaComment
} from 'react-icons/fa';

const menu = [
  { label: 'Home', path: '/', icon: <FaRoad /> },
  { label: 'roadmap', path: '/roadmap', icon: <FaLayerGroup /> },
  { label: 'Budget', path: '/budget', icon: <FaMoneyBill /> },
  { label: 'Trending', path: '/trending-products', icon: <FaSearch /> },
  { label: 'Competitor', path: '/competitor', icon: <FaChartLine /> },
  { label: 'Profit', path: '/profit', icon: <FaChartLine /> },
  { label: 'Vendors', path: '/vendors', icon: <FaUsers /> },
  { label: 'Platform', path: '/platformAdvice', icon: <FaLayerGroup /> },
  { label: 'Guide', path: '/guide', icon: <FaListUl  /> },
  { label: 'Tutorials', path: '/tutorials', icon: <FaChalkboardTeacher /> },
  // { label: 'Mentor Chat', path: '/mentor-chat', icon: <FaComment /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-teal-100 h-screen p-4 flex flex-col shadow-md">
      <div className="text-2xl font-bold text-teal-700 mb-8">ECommerce Guider</div>
      <nav className="flex flex-col space-y-2">
        {menu.map((item) => (
          <Link key={item.path} to={item.path}>
            <div
              className={`flex items-center px-4 py-2 rounded-md hover:bg-teal-200 transition cursor-pointer ${
                pathname === item.path ? 'bg-teal-300 font-semibold' : ''
              }`}
            >
              <span className="mr-3 text-teal-700">{item.icon}</span>
              {item.label}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
