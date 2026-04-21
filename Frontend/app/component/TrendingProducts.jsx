'use client';
import React, { useState } from 'react';
import axios from 'axios';
import {
  FaFire, FaSearch, FaLightbulb, FaExclamationCircle,
  FaRedo, FaExternalLinkAlt, FaGlobe
} from 'react-icons/fa';

const SUGGESTIONS = [
  'Skincare', 'Electronics', 'Phone accessories',
  'Baby products', 'Fitness gear', 'Home decor',
];

// Pull a clean domain name from a URL, e.g. "daraz.pk" from "https://www.daraz.pk/..."
function getDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function TrendingProducts() {
  const [keyword, setKeyword] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchTrendingProducts = async (override) => {
    const value = (override ?? keyword).trim();
    if (!value) return;
    if (override) setKeyword(override);
    setCurrentQuery(value);

    setLoading(true);
    setError('');
    setResults([]);
    setHasSearched(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to search trends.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:4000/api/trending-products',
        { keyword: value },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(response.data.results || []);
    } catch (err) {
      console.error('Error fetching trending products:', err.response?.data || err.message);
      setError('Failed to fetch trending products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto">

      {/* ═══ HERO + SEARCH CARD ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex items-start sm:items-center gap-3 mb-5">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
            <FaFire className="text-white text-lg sm:text-xl animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Trending Products
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
              Discover what&apos;s hot right now — search any category to see current trending products in Pakistan.
            </p>
          </div>
        </div>

        {/* Search row */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search trends like gadgets, skincare, fashion…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTrendingProducts()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => fetchTrendingProducts()}
            disabled={loading || !keyword.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaSearch /> {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Suggestion chips */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <FaLightbulb className="text-amber-500" /> Try:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => fetchTrendingProducts(s)}
              disabled={loading}
              className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200 transition disabled:opacity-60 font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ LOADING SKELETON ═══ */}
      {loading && (
        <div>
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="h-1.5 bg-slate-100" />
                <div className="p-5 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-5 w-20 bg-orange-100 rounded-full" />
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-100 rounded mb-1.5" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded mb-4" />
                  <div className="h-10 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
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
              onClick={() => fetchTrendingProducts(currentQuery)}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
            >
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {!loading && !error && results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Top results for{' '}
              <span className="text-teal-700">&ldquo;{currentQuery}&rdquo;</span>
              <span className="text-slate-400 font-normal text-sm ml-2">
                ({results.length})
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((item, index) => (
              <TrendCard key={index} item={item} rank={index + 1} />
            ))}
          </div>
        </>
      )}

      {/* ═══ NO RESULTS (after search) ═══ */}
      {!loading && !error && hasSearched && results.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center mx-auto mb-3">
            <FaFire className="text-orange-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">No trends found</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Try a broader search like &ldquo;electronics&rdquo; or &ldquo;fashion&rdquo; — or pick a suggestion above.
          </p>
        </div>
      )}

      {/* ═══ INITIAL EMPTY STATE ═══ */}
      {!loading && !error && !hasSearched && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center mx-auto mb-3">
            <FaFire className="text-orange-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">What&apos;s hot today?</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Enter a category above or tap a suggestion to see trending products right now.
          </p>
        </div>
      )}
    </section>
  );
}

// ════════════════════════════════════════════════
// TREND CARD
// ════════════════════════════════════════════════
function TrendCard({ item, rank }) {
  const domain = getDomain(item.url);
  const content = item.content || 'No description available.';
  const truncated = content.length > 140 ? content.slice(0, 140).trim() + '…' : content;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Orange gradient strip */}
      <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row: rank badge + source */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full shadow-sm">
            <FaFire size={10} /> #{rank}
          </span>
          {domain && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate max-w-[60%]">
              <FaGlobe size={9} className="text-slate-400" />
              <span className="truncate">{domain}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2">
          {item.title || 'Untitled'}
        </h3>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
          {truncated}
        </p>

        {/* CTA */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
        >
          View Source <FaExternalLinkAlt size={10} />
        </a>
      </div>
    </div>
  );
}