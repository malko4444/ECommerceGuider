'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { FaListCheck, FaRocket } from 'react-icons/fa6';
import ReactMarkdown from 'react-markdown';

export default function Guide() {
  const [platform, setPlatform] = useState('');
  const [guideText, setGuideText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLaunchGuide = async () => {
    if (!platform.trim()) return;
    setLoading(true);
    setError('');
    setGuideText('');

    try {
      const response = await axios.post('http://localhost:4000/api/guide', {
        platform: platform.trim(),
      },
    {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ attach token
          },
        });

      const { guide } = response.data;
      if (!guide) throw new Error('No guide content returned');
      setGuideText(guide);
    } catch (err) {
      console.error('Error fetching guide:', err);
      setError('Failed to fetch guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
        <FaListCheck className="text-teal-600" />
        Launch Checklist Generator
      </h2>

      {/* Input Field */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter platform (e.g., Shopify, Daraz, Instagram Shop)"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchLaunchGuide()}
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <button
          onClick={fetchLaunchGuide}
          className="bg-teal-600 text-white px-3 py-2 rounded-full hover:bg-teal-700 transition flex items-center gap-2"
        >
          <FaRocket /> Guidance
        </button>
      </div>

      {/* Feedback */}
      {loading && <p className="text-teal-500 font-semibold mb-4">Generating guide...</p>}
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      {/* Guide Output */}
      {!loading && !error && guideText && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-md prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800">
          <ReactMarkdown>{guideText}</ReactMarkdown>
        </div>
      )}
    </section>
  );
}
