'use client';
import React, { useState } from 'react';
import axios from 'axios';
import {
  FaChartLine, FaSearch, FaExternalLinkAlt, FaLightbulb,
  FaExclamationCircle, FaRedo, FaGlobe, FaInfoCircle
} from 'react-icons/fa';

const SUGGESTIONS = [
  'Wireless earbuds',
  "Women's kurtis",
  'Phone cases',
  'Skincare serum',
  'Smart watches',
];

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function Competitor() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const [productInput, setProductInput] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchCompetitorAnalysis = async (override) => {
    const value = (override ?? productInput).trim();
    if (!value) return;
    if (override) setProductInput(override);
    setCurrentQuery(value);

    setLoading(true);
    setError('');
    setAnalysisText('');
    setCompetitors([]);
    setHasSearched(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_BASE_URL}/api/competitor`,
        { product: value },                             // ← body
        {                                                // ← config
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const { analysis, competitors: comps } = response.data;
      if (!analysis) throw new Error('Invalid response format');

      setAnalysisText(analysis);
      setCompetitors(Array.isArray(comps) ? comps : []);
    } catch (err) {
      console.error('Error fetching competitor analysis:', err.response?.data || err.message);
      setError('Failed to load competitor analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Detect the "not applicable" warning case the backend returns
  const isWarningAnalysis = analysisText.startsWith('⚠️');

  return (
    <section className="max-w-6xl mx-auto">

      {/* ═══ HERO + INPUT CARD ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex items-start sm:items-center gap-3 mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
            <FaChartLine className="text-white text-lg sm:text-xl" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Competitor Analysis
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
              See who you&apos;re up against — real stores, pricing strategies, and positioning in Pakistan&apos;s market.
            </p>
          </div>
        </div>

        {/* Input row */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. wireless earbuds, sneakers, kurtis…"
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCompetitorAnalysis()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => fetchCompetitorAnalysis()}
            disabled={loading || !productInput.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaSearch /> {loading ? 'Analyzing…' : 'Analyze'}
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
              onClick={() => fetchCompetitorAnalysis(s)}
              disabled={loading}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full border border-teal-200 transition disabled:opacity-60 font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ LOADING SKELETON ═══ */}
      {loading && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-3 w-full bg-slate-100 rounded mb-2" />
            <div className="h-3 w-4/5 bg-slate-100 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="h-1.5 bg-slate-100" />
                <div className="p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-slate-200 rounded" />
                      <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded mb-4" />
                  <div className="h-10 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-teal-600 text-sm font-semibold flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            Scanning the market for competitors…
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
              onClick={() => fetchCompetitorAnalysis(currentQuery)}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
            >
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* ═══ ANALYSIS SUMMARY ═══ */}
      {!loading && !error && analysisText && (
        <div className={`
          rounded-2xl p-5 sm:p-6 border mb-6 flex items-start gap-4
          ${isWarningAnalysis
            ? 'bg-amber-50 border-amber-200'
            : 'bg-gradient-to-br from-teal-50 to-white border-teal-200'}
        `}>
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${isWarningAnalysis ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'}
          `}>
            {isWarningAnalysis ? <FaExclamationCircle /> : <FaInfoCircle />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm mb-1">
              {isWarningAnalysis ? 'Heads up' : `Market overview for "${currentQuery}"`}
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              {analysisText}
            </p>
          </div>
        </div>
      )}

      {/* ═══ COMPETITOR GRID ═══ */}
      {!loading && !error && competitors.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Competitors found
              <span className="text-slate-400 font-normal text-sm ml-2">
                ({competitors.length})
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {competitors.map((comp, index) => (
              <CompetitorCard key={index} comp={comp} />
            ))}
          </div>
        </>
      )}

      {/* ═══ NO COMPETITORS FOUND (but analysis exists) ═══ */}
      {!loading && !error && analysisText && competitors.length === 0 && !isWarningAnalysis && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FaChartLine className="text-slate-400 text-xl" />
          </div>
          <p className="text-slate-800 font-semibold">No verifiable competitors listed</p>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            We couldn&apos;t find established online stores for this product in our research data.
            Try a more specific product name.
          </p>
        </div>
      )}

      {/* ═══ INITIAL EMPTY STATE ═══ */}
      {!loading && !error && !hasSearched && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaChartLine className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Who&apos;s selling what?</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Enter a product above or pick a suggestion to discover real competitors and their strategies.
          </p>
        </div>
      )}
    </section>
  );
}

// ════════════════════════════════════════════════
// COMPETITOR CARD
// ════════════════════════════════════════════════
function CompetitorCard({ comp }) {
  const domain = getDomain(comp.website);
  const websiteHref = comp.website?.startsWith('http')
    ? comp.website
    : comp.website ? `https://${comp.website}` : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-700" />

      <div className="p-5 flex flex-col flex-1">
        {/* Identity */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {comp.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
              {comp.name || 'Unnamed competitor'}
            </h3>
            {domain && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                <FaGlobe size={9} className="text-slate-400 shrink-0" />
                <span className="truncate">{domain}</span>
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
          {comp.description || 'No details available.'}
        </p>

        {/* CTA */}
        {websiteHref ? (
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            Visit Store <FaExternalLinkAlt size={10} />
          </a>
        ) : (
          <div className="mt-auto text-xs text-slate-400 text-center py-2 border border-dashed border-slate-200 rounded-lg">
            No website provided
          </div>
        )}
      </div>
    </div>
  );
}