'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { FaFire, FaSearch, FaShoppingCart } from 'react-icons/fa';

const hardcodedTrends = [
  {
    title: 'Wireless Earbuds',
    content: 'High-quality noise-canceling earbuds with long battery life.',
    url: 'https://example.com/earbuds',
  },
  {
    title: 'Smart Water Bottle',
    content: 'Tracks your hydration level and glows when it’s time to drink.',
    url: 'https://example.com/water-bottle',
  },
  {
    title: 'Standing Desk Converter',
    content: 'Turn any desk into a standing workspace. Adjustable and durable.',
    url: 'https://example.com/desk-converter',
  },
];

export default function TrendingProducts() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrendingProducts = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/trending-products', {
        keyword: keyword.trim(),
      });
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  const dataToShow = results.length > 0 ? results : hardcodedTrends;

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaFire className="text-orange-500 animate-pulse" />
        Trending Products
      </h2>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search trends like gadgets, tech, AI..."
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchTrendingProducts()}
        />
        <button
          onClick={fetchTrendingProducts}
          className="bg-teal-600 text-white px-3 py-2 rounded-full hover:bg-teal-700 transition flex items-center gap-2"
        >
          <FaSearch /> Search
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-teal-500 font-semibold mb-4">Fetching trending items...</p>}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dataToShow.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition"
          >
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full mb-2 inline-block">
              Trending #{index + 1}
            </span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-4">
              {item.content.length > 120 ? item.content.slice(0, 120) + '...' : item.content}
            </p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition"
            >
              <FaShoppingCart /> View Product
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
