'use client';
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaListCheck, FaRocket } from 'react-icons/fa6';
import {
  FaSearch, FaExclamationCircle, FaRedo, FaShopify,
  FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp, FaStore
} from 'react-icons/fa';

// Real platforms the backend system prompt supports
const PLATFORMS = [
  { name: 'Daraz',              icon: <FaStore />,     color: 'text-orange-600', bg: 'bg-orange-50',   border: 'border-orange-200',  activeBorder: 'border-orange-400' },
  { name: 'Shopify',            icon: <FaShopify />,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', activeBorder: 'border-emerald-400' },
  { name: 'Instagram Shop',     icon: <FaInstagram />, color: 'text-pink-600',   bg: 'bg-pink-50',     border: 'border-pink-200',    activeBorder: 'border-pink-400' },
  { name: 'Facebook Marketplace', icon: <FaFacebookF />, color: 'text-blue-600', bg: 'bg-blue-50',     border: 'border-blue-200',    activeBorder: 'border-blue-400' },
  { name: 'TikTok Shop',        icon: <FaTiktok />,    color: 'text-slate-900',  bg: 'bg-slate-50',    border: 'border-slate-200',   activeBorder: 'border-slate-400' },
  { name: 'WhatsApp Business',  icon: <FaWhatsapp />,  color: 'text-green-600',  bg: 'bg-green-50',    border: 'border-green-200',   activeBorder: 'border-green-400' },
];

export default function Guide() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const [platform, setPlatform] = useState('');
  const [currentPlatform, setCurrentPlatform] = useState('');
  const [guideText, setGuideText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLaunchGuide = async (override) => {
    const value = (override ?? platform).trim();
    if (!value) return;
    if (override) setPlatform(override);
    setCurrentPlatform(value);

    setLoading(true);
    setError('');
    setGuideText('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to generate a guide.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/guide`,
        { platform: value },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { guide } = response.data;
      if (!guide) throw new Error('No guide content returned');
      setGuideText(guide);

      // Smooth scroll to result
      setTimeout(() => {
        window.scrollBy({ top: 400, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error fetching guide:', err.response?.data || err.message);
      setError('Failed to fetch guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto">

      {/* ═══ HERO ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex items-start sm:items-center gap-3 mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
            <FaRocket className="text-white text-lg sm:text-xl" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Launch Guide
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
              Pick a platform to get a complete step-by-step checklist — from signup to going live in Pakistan.
            </p>
          </div>
        </div>

        {/* Platform picker grid */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Choose your platform
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {PLATFORMS.map((p) => {
            const active = currentPlatform === p.name;
            return (
              <button
                key={p.name}
                onClick={() => fetchLaunchGuide(p.name)}
                disabled={loading}
                className={`
                  group relative bg-white rounded-xl border-2 p-4
                  transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${active
                    ? `${p.activeBorder} shadow-md -translate-y-0.5`
                    : `border-slate-100 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5`}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${p.bg} ${p.color}`}>
                    {p.icon}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm leading-tight truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {active ? 'Selected' : 'Get checklist'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Custom platform input */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Type another platform
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. OLX, Etsy, Amazon…"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLaunchGuide()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition"
            />
          </div>
          <button
            onClick={() => fetchLaunchGuide()}
            disabled={loading || !platform.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaRocket /> {loading ? 'Generating…' : 'Generate'}
          </button>
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-5 animate-pulse">
              <div className="h-5 w-1/3 bg-slate-200 rounded mb-3" />
              <div className="space-y-2 pl-4">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-5/6 bg-slate-100 rounded" />
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
          <p className="text-teal-600 text-sm font-semibold mt-4 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            Building your 5-phase launch checklist…
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
            {currentPlatform && (
              <button
                onClick={() => fetchLaunchGuide(currentPlatform)}
                className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
              >
                <FaRedo size={11} /> Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══ RESULT ═══ */}
      {!loading && !error && guideText && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FaListCheck />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
              Launch checklist for{' '}
              <span className="text-teal-700">{currentPlatform}</span>
            </h3>
          </div>
          <div className="prose prose-sm sm:prose-base max-w-none text-slate-700
                          prose-headings:text-slate-900 prose-headings:font-bold
                          prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
                          prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
                          prose-strong:text-slate-900
                          prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                          prose-li:my-1
                          prose-ol:my-2 prose-ul:my-2">
            <ReactMarkdown>{guideText}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!loading && !error && !guideText && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaRocket className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Ready for launch?</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Pick a platform above to get a complete 5-phase checklist: setup, listing, payments, launch, and optimization.
          </p>
        </div>
      )}
    </section>
  );
}