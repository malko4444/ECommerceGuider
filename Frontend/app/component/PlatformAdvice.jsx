'use client';
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  FaSearch, FaLightbulb, FaExclamationCircle, FaRedo,
  FaShopify, FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp,
  FaStore, FaCompass
} from 'react-icons/fa';

const GOAL_SUGGESTIONS = [
  'Sell handmade jewelry',
  'Dropship phone accessories',
  'Launch a clothing brand',
  'Start a skincare line',
  'Sell home-cooked food',
];

// Decorative — shows what platforms the tool covers
const PLATFORMS = [
  { name: 'Daraz',     icon: <FaStore />,     color: 'text-orange-600' },
  { name: 'Shopify',   icon: <FaShopify />,   color: 'text-emerald-600' },
  { name: 'Instagram', icon: <FaInstagram />, color: 'text-pink-600' },
  { name: 'Facebook',  icon: <FaFacebookF />, color: 'text-blue-600' },
  { name: 'TikTok',    icon: <FaTiktok />,    color: 'text-slate-900' },
  { name: 'WhatsApp',  icon: <FaWhatsapp />,  color: 'text-green-600' },
];

export default function PlatformAdvice() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const [goal, setGoal] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [adviceText, setAdviceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlatformAdvice = async (override) => {
    const value = (override ?? goal).trim();
    if (!value) return;
    if (override) setGoal(override);
    setCurrentQuery(value);

    setLoading(true);
    setError('');
    setAdviceText('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to get platform advice.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/platform`,
        { goal: value },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { advice } = response.data;
      if (!advice) throw new Error('Invalid response format');
      setAdviceText(advice);
    } catch (err) {
      console.error('Error fetching platform advice:', err.response?.data || err.message);
      setError('Failed to get platform suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto">

      {/* ═══ HERO + INPUT CARD ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex items-start sm:items-center gap-3 mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <FaLightbulb className="text-white text-lg sm:text-xl" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Platform Advisor
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
              Describe what you want to sell — we&apos;ll recommend the best channel in Pakistan to launch on.
            </p>
          </div>
        </div>

        {/* Input row */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaCompass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. sell handmade crafts, launch clothing brand…"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPlatformAdvice()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => fetchPlatformAdvice()}
            disabled={loading || !goal.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaSearch /> {loading ? 'Finding…' : 'Get Advice'}
          </button>
        </div>

        {/* Goal suggestion chips */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <FaLightbulb className="text-amber-500" /> Try:
          </span>
          {GOAL_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => fetchPlatformAdvice(s)}
              disabled={loading}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200 transition disabled:opacity-60 font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ PLATFORMS COVERED STRIP ═══ */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 mb-6 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Platforms we recommend across
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg"
            >
              <span className={`text-base ${p.color}`}>{p.icon}</span>
              <span className="text-xs font-semibold text-slate-700">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ LOADING SKELETON ═══ */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 animate-pulse" />
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
            Matching your goal to the right platform…
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
            {currentQuery && (
              <button
                onClick={() => fetchPlatformAdvice(currentQuery)}
                className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
              >
                <FaRedo size={11} /> Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══ RESULT ═══ */}
      {!loading && !error && adviceText && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FaLightbulb />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
              Recommendation for{' '}
              <span className="text-teal-700">&ldquo;{currentQuery}&rdquo;</span>
            </h3>
          </div>
          <div className="prose prose-sm sm:prose-base max-w-none text-slate-700
                          prose-headings:text-slate-900 prose-headings:font-bold
                          prose-strong:text-slate-900
                          prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                          prose-li:my-1
                          prose-table:border prose-th:bg-slate-50 prose-th:p-2 prose-td:p-2 prose-td:border">
            <ReactMarkdown>{adviceText}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!loading && !error && !adviceText && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mx-auto mb-3">
            <FaLightbulb className="text-amber-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Pick the right channel to launch</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Tell us what you want to sell — we&apos;ll match it to the best platform for Pakistan&apos;s market.
          </p>
        </div>
      )}
    </section>
  );
}