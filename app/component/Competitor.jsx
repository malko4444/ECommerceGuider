'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { FaChartLine, FaSearch, FaExternalLinkAlt } from 'react-icons/fa';

export default function Competitor() {
  const [productInput, setProductInput] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCompetitorAnalysis = async () => {
    if (!productInput.trim()) return;
    setLoading(true);
    setError('');
    setAnalysisText('');
    setCompetitors([]);

    try {
      const response = await axios.post('http://localhost:4000/api/competitor', {
        product: productInput.trim(),
      });

      const { analysis, competitors } = response.data;
      if (!analysis || !Array.isArray(competitors)) {
        throw new Error('Invalid response format');
      }

      setAnalysisText(analysis);
      setCompetitors(competitors);
      console.log('Competitors:', competitors);
      console.log('Analysis:', analysis);
    } catch (err) {
      console.error('Error fetching competitor analysis:', err);
      setError('Failed to load competitor analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaChartLine className="text-teal-600" />
        Competitor Analysis Tool
      </h2>

      {/* Input and Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Enter product name like wristwatch, sneakers, etc."
          value={productInput}
          onChange={(e) => setProductInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchCompetitorAnalysis()}
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <button
          onClick={fetchCompetitorAnalysis}
          className="bg-teal-600 text-white px-3 py-2 rounded-full hover:bg-teal-700 transition flex items-center gap-2"
        >
          <FaSearch /> Analyze
        </button>
      </div>

      {/* Feedback */}
      {loading && <p className="text-orange-500 font-semibold mb-4">Analyzing competitors...</p>}
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      {/* Analysis Summary */}
      {!loading && !error && analysisText && (
        <div className="bg-gray-100 p-4 rounded-xl mb-6 text-gray-800">
          <p className="text-lg font-medium">{analysisText}</p>
        </div>
      )}

      {/* Competitor List */}
      {!loading && !error && competitors.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {competitors.map((comp, index) => (
            <div key={index} className="bg-white border rounded-xl p-5 shadow hover:shadow-md transition">
              <h3 className="text-xl font-bold text-teal-700">{comp.name}</h3>
              <p className="text-gray-600 my-2">{comp.description}</p>
              {/* <a
                href={comp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:underline"
              >
                Visit Site <FaExternalLinkAlt className="ml-1" />
              </a> */}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
