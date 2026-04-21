'use client';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  FaStore, FaSyncAlt, FaSearch, FaGlobe, FaEnvelope,
  FaExternalLinkAlt, FaTags
} from 'react-icons/fa';

// Same palette as the Admin page — keeps the app feeling consistent
const CATEGORY_STYLES = {
  "Home Decor":    "bg-amber-50  text-amber-700  border-amber-200",
  "Electronics":   "bg-sky-50    text-sky-700    border-sky-200",
  "IT Services":   "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Clothing":      "bg-pink-50   text-pink-700   border-pink-200",
  "Food Supplier": "bg-orange-50 text-orange-700 border-orange-200",
  "Construction":  "bg-stone-100 text-stone-700  border-stone-200",
  "Marketing":     "bg-purple-50 text-purple-700 border-purple-200",
  "Other":         "bg-slate-50  text-slate-700  border-slate-200",
};

const CATEGORIES = [
  "Home Decor", "Electronics", "IT Services", "Clothing",
  "Food Supplier", "Construction", "Marketing", "Other"
];

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:4000/vendor/dashboard');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Could not load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter(v => {
      const matchesSearch = !q ||
        v.vendorName?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.website?.toLowerCase().includes(q);
      const matchesCat = !filterCategory || v.category === filterCategory;
      return matchesSearch && matchesCat;
    });
  }, [vendors, search, filterCategory]);

  const uniqueCategories = new Set(vendors.map(v => v.category)).size;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ═══ HERO ═══ */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
                <FaStore className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Vendor Directory
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Browse trusted suppliers and partners curated for Pakistani e-commerce sellers.
                </p>
              </div>
            </div>

            <button
              onClick={fetchVendors}
              disabled={loading}
              className="bg-white border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 px-4 py-2.5 rounded-lg transition flex items-center gap-2 font-medium shadow-sm disabled:opacity-60 self-start"
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* ═══ STATS STRIP ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatPill icon={<FaStore />}       label="Total Vendors"    value={vendors.length}         tone="teal" />
          <StatPill icon={<FaTags />}        label="Categories"       value={uniqueCategories}       tone="purple" />
          <StatPill icon={<FaSearch />}      label="Showing"          value={filteredVendors.length} tone="amber" />
        </div>

        {/* ═══ SEARCH + FILTER ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by name, email, or website…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-slate-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white sm:w-56"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* ═══ ERROR BANNER ═══ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ═══ CONTENT ═══ */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredVendors.length === 0 ? (
          <EmptyState
            title={vendors.length === 0 ? "No vendors available yet" : "No vendors match your search"}
            subtitle={vendors.length === 0
              ? "Check back soon — new suppliers are added regularly."
              : "Try a different search term or category filter."}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor._id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════

function StatPill({ icon, label, value, tone }) {
  const tones = {
    teal:   "bg-teal-50   text-teal-600",
    purple: "bg-purple-50 text-purple-600",
    amber:  "bg-amber-50  text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function VendorCard({ vendor }) {
  const catStyle = CATEGORY_STYLES[vendor.category] || CATEGORY_STYLES.Other;
  const websiteHref = vendor.website?.startsWith('http')
    ? vendor.website
    : `https://${vendor.website}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Decorative header strip */}
      <div className="h-2 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-700" />

      <div className="p-6 flex flex-col flex-1">
        {/* Identity row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {vendor.vendorName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">
              {vendor.vendorName}
            </h3>
            <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catStyle}`}>
              {vendor.category}
            </span>
          </div>
        </div>

        {/* Contact rows */}
        <div className="space-y-2 text-sm mb-5">
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <FaGlobe className="text-slate-400 shrink-0" size={12} />
            <span className="truncate">{vendor.website}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <FaEnvelope className="text-slate-400 shrink-0" size={12} />
            <span className="truncate">{vendor.email}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <a
            href={websiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            Visit <FaExternalLinkAlt size={10} />
          </a>
          <a
            href={`mailto:${vendor.email}`}
            className="inline-flex items-center justify-center w-11 h-11 bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-lg transition border border-slate-200"
            title="Send email"
          >
            <FaEnvelope size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
        >
          <div className="h-2 bg-slate-100" />
          <div className="p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-100 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded-full" />
              </div>
            </div>
            <div className="space-y-2 mb-5">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
            </div>
            <div className="h-10 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-teal-50 flex items-center justify-center mx-auto mb-4">
        <FaStore className="text-slate-400 text-3xl" />
      </div>
      <p className="text-slate-800 font-bold text-lg">{title}</p>
      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">{subtitle}</p>
    </div>
  );
}