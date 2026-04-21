'use client';
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  FaRoad, FaSearch, FaLightbulb, FaExclamationCircle,
  FaRedo
} from 'react-icons/fa';

const EXAMPLES = [
  "Women's clothing",
  "Mobile accessories",
  "Skincare products",
  "Handmade jewelry",
  "Home decor",
];

export default function RoadMap() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [inputType, setInputType] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRoadmap = async (override) => {
    const value = (override ?? inputType).trim();
    if (!value) return;
    if (override) setInputType(override);
    setCurrentQuery(value);

    setLoading(true);
    setError('');
    setRoadmap('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/roadmap`,
        { type: value },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const roadmapText = response.data?.roadmap;
      if (!roadmapText) throw new Error('No roadmap returned from server.');
      setRoadmap(roadmapText);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setError('Failed to load roadmap. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto">

      {/* ═══ HERO + INPUT CARD ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex items-start sm:items-center gap-3 mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
            <FaRoad className="text-white text-lg sm:text-xl" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Startup Roadmap Generator
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
              Get a phase-by-phase launch plan tailored to your product for Pakistan&apos;s market.
            </p>
          </div>
        </div>

        {/* Input row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. clothing, home decor, skincare..."
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRoadmap()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => fetchRoadmap()}
            disabled={loading || !inputType.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaSearch /> {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {/* Suggestion chips */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <FaLightbulb className="text-amber-500" /> Try:
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => fetchRoadmap(ex)}
              disabled={loading}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full border border-teal-200 transition disabled:opacity-60"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ LOADING SKELETON ═══ */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 mb-4 animate-pulse">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-4/5 bg-slate-100 rounded" />
              <div className="h-3 w-3/5 bg-slate-100 rounded" />
            </div>
          ))}
          <p className="text-teal-600 text-sm font-semibold mt-4 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            Crafting your roadmap…
          </p>
        </div>
      )}

      {/* ═══ ERROR ═══ */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FaExclamationCircle />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">Something went wrong</p>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
            <button
              onClick={() => fetchRoadmap(currentQuery)}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
            >
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* ═══ RESULT ═══ */}
      {!loading && !error && roadmap && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FaRoad />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
              Roadmap for{' '}
              <span className="text-teal-700">&ldquo;{currentQuery}&rdquo;</span>
            </h3>
          </div>
          <div className="prose prose-sm sm:prose-base max-w-none text-slate-700
                          prose-headings:text-slate-900 prose-headings:font-bold
                          prose-strong:text-slate-900
                          prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                          prose-li:my-1">
            <ReactMarkdown>{roadmap}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!loading && !error && !roadmap && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaRoad className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Ready when you are</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Enter a product or business type above, or click a suggestion chip to see a full startup roadmap.
          </p>
        </div>
      )}
    </section>
  );
}