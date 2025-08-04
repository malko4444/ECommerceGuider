'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { FaStore, FaSyncAlt } from 'react-icons/fa';

const hardcodedVendors = [
  {
    title: 'Local Supplier Hub',
    content: 'Reliable wholesaler based in Lahore offering fast delivery and COD.',
    url: 'https://www.thekrogerco.com/vendor-suppliers/supplier-hub/',
  },
  {
    title: 'AliExpress Verified Seller',
    content: 'High-rated AliExpress supplier with dropshipping support for Pakistani stores.',
    url: 'https://www.aliexpress.com/w/wholesale-verified-supplier.html',
  },
  {
    title: 'Karachi Import Bazaar',
    content: 'Deals in electronics and fashion with bulk pricing options.',
    url: 'https://importedbazar.com/',
  },
];

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/vendors');
      setVendors(response.data.vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const dataToShow = vendors.length > 0 ? vendors : hardcodedVendors;

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaStore className="text-teal-600 animate-bounce" />
        Vendor Directory
      </h2>

      {/* Refresh Button */}
      <div className="mb-8">
        <button
          onClick={fetchVendors}
          className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition flex items-center gap-2"
        >
          <FaSyncAlt /> Refresh Vendor List
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <p className="text-teal-500 font-semibold mb-4">Loading vendors...</p>}

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dataToShow.map((vendor, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition"
          >
            <span className="text-xs bg-indigo-100 text-teal-600 px-2 py-1 rounded-full mb-2 inline-block">
              Vendor #{index + 1}
            </span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{vendor.title}</h3>
            <p className="text-gray-600 mb-4">
              {vendor.content.length > 120 ? vendor.content.slice(0, 120) + '...' : vendor.content}
            </p>
            <a
              href={vendor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition"
            >
              Visit Vendor
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
