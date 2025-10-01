'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaLightbulb } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

export default function PlatformAdvice() {
  const [goal, setGoal] = useState('');
  const [adviceText, setAdviceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlatformAdvice = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError('');
    setAdviceText('');

    try {
      const response = await axios.post('http://localhost:4000/api/platform', {
        goal: goal.trim(),
        Credential:true
      });

      const { advice } = response.data;
      if (!advice) throw new Error('Invalid response format');

      setAdviceText(advice);
      console.log('Platform Advice:', advice);
    } catch (err) {
      console.error('Error fetching platform advice:', err);
      setError('Failed to get platform suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaLightbulb className="text-teal-600" />
        Best Platform Suggestion
      </h2>

      {/* Input Field */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="e.g. start dropshipping, launch clothing brand, sell handmade items"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPlatformAdvice()}
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={fetchPlatformAdvice}
          className="bg-teal-600 text-white px-5 py-3 rounded-full hover:bg-teal-700 transition flex items-center gap-2"
        >
          <FaSearch /> Suggest
        </button>
      </div>

      {/* Feedback */}
      {loading && <p className="text-teal-500 font-semibold mb-4">Finding the best platform...</p>}
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      {/* Result */}
      {!loading && !error && adviceText && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-md prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800">
                  <ReactMarkdown>{adviceText}</ReactMarkdown>
                </div>
      )}
    </section>
  );
}
