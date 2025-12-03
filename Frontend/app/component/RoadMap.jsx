'use client';
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaRoad, FaSearch } from 'react-icons/fa';

export default function RoadMap() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [inputType, setInputType] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRoadmap = async () => {
    if (!inputType.trim()) return;
    setLoading(true);
    setError('');
    setRoadmap('');

    try {
      const token = localStorage.getItem("token"); // 🔑 get token
      console.log("the toen ", token);
      
      if (!token) {
        throw new Error("No token found. Please login again.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/roadmap`,
        { type: inputType.trim() }, // body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ attach token
          },
        }
      );

      const roadmapText = response.data?.roadmap;
      if (!roadmapText) throw new Error("No roadmap returned from server.");

      setRoadmap(roadmapText);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setError('Failed to load roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaRoad className="text-teal-600" />
        Startup Roadmap Generator
      </h2>

      {/* Input and Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Enter product type like clothing, home decor, etc."
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchRoadmap()}
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <button
          onClick={fetchRoadmap}
          className="bg-teal-600 text-white px-3 py-2 rounded-full hover:bg-teal-700 transition flex items-center gap-2"
        >
          <FaSearch /> Generate
        </button>
      </div>

      {/* Feedback */}
      {loading && <p className="text-orange-500 font-semibold mb-4">Generating roadmap...</p>}
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      {/* Markdown Result */}
      {!loading && !error && roadmap && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-md prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800">
          <ReactMarkdown>{roadmap}</ReactMarkdown>
        </div>
      )}
    </section>
  );
}
