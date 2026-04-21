'use client';
import React, { useMemo, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  FaMoneyBillWave, FaSearchDollar, FaLightbulb,
  FaExclamationCircle, FaRedo, FaCoins
} from 'react-icons/fa';

// Budget tiers match the backend system prompt — keep in sync.
const TIERS = [
  { min: 1,      max: 4999,    label: 'Micro',  tone: 'bg-slate-100 text-slate-700 border-slate-200',   note: 'Digital products or dropshipping' },
  { min: 5000,   max: 24999,   label: 'Small',  tone: 'bg-sky-50    text-sky-700    border-sky-200',    note: '1 product, minimal stock' },
  { min: 25000,  max: 99999,   label: 'Medium', tone: 'bg-purple-50 text-purple-700 border-purple-200', note: 'Proper inventory approach' },
  { min: 100000, max: Infinity,label: 'Large',  tone: 'bg-teal-50   text-teal-700   border-teal-200',   note: 'Multi-product with branding' },
];

const PRESETS = [
  { amount: 5000,   label: 'PKR 5K' },
  { amount: 15000,  label: 'PKR 15K' },
  { amount: 50000,  label: 'PKR 50K' },
  { amount: 100000, label: 'PKR 1 Lakh' },
  { amount: 250000, label: 'PKR 2.5 Lakh' },
];

function formatPKR(n) {
  const num = Number(n);
  if (!num || isNaN(num)) return '';
  return num.toLocaleString('en-PK');
}

function getTier(amount) {
  const num = Number(amount);
  if (!num || isNaN(num) || num <= 0) return null;
  return TIERS.find(t => num >= t.min && num <= t.max) || null;
}

export default function Budget() {
  const [budgetInput, setBudgetInput] = useState('');
  const [currentBudget, setCurrentBudget] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const liveTier = useMemo(() => getTier(budgetInput), [budgetInput]);

  const fetchBudgetPlan = async (override) => {
    const value = (override ?? budgetInput).toString().trim();
    if (!value) return;
    if (override !== undefined) setBudgetInput(String(override));
    setCurrentBudget(value);

    setLoading(true);
    setError('');
    setPlan('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/budget',
        { budget: value },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const planText = response.data?.plan;
      if (!planText) throw new Error('No plan returned from server.');
      setPlan(planText);
    } catch (err) {
      console.error('Error fetching budget plan:', err);
      setError('Failed to load budget plan. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    // Allow only digits — keeps input clean for currency
    const value = e.target.value.replace(/[^\d]/g, '');
    setBudgetInput(value);
  };

  return (
    <section className="max-w-5xl mx-auto">

      {/* ═══ HERO + INPUT CARD ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 mb-6">
        <div className="flex items-start sm:items-center gap-3 mb-5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
            <FaMoneyBillWave className="text-white text-lg sm:text-xl" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Budget Planner
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
              Enter your starting capital in PKR and get a detailed allocation plan for your online business.
            </p>
          </div>
        </div>

        {/* Input row */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none">
              PKR
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={budgetInput}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && fetchBudgetPlan()}
              className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 outline-none transition font-semibold text-slate-900 text-base"
            />
            {/* Formatted preview */}
            {budgetInput && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hidden sm:inline">
                {formatPKR(budgetInput)}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchBudgetPlan()}
            disabled={loading || !budgetInput.trim()}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaSearchDollar /> {loading ? 'Generating…' : 'Generate Plan'}
          </button>
        </div>

        {/* Live tier indicator */}
        {liveTier && (
          <div className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${liveTier.tone}`}>
            <FaCoins size={10} />
            {liveTier.label} budget · {liveTier.note}
          </div>
        )}

        {/* Preset chips */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <FaLightbulb className="text-amber-500" /> Quick pick:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.amount}
              onClick={() => fetchBudgetPlan(preset.amount)}
              disabled={loading}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full border border-teal-200 transition disabled:opacity-60 font-semibold"
            >
              {preset.label}
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
            Calculating your budget breakdown…
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
              onClick={() => fetchBudgetPlan(currentBudget)}
              className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
            >
              <FaRedo size={11} /> Try again
            </button>
          </div>
        </div>
      )}

      {/* ═══ RESULT ═══ */}
      {!loading && !error && plan && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FaMoneyBillWave />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
              Budget Plan for{' '}
              <span className="text-teal-700">PKR {formatPKR(currentBudget)}</span>
            </h3>
          </div>
          <div className="prose prose-sm sm:prose-base max-w-none text-slate-700
                          prose-headings:text-slate-900 prose-headings:font-bold
                          prose-strong:text-slate-900
                          prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                          prose-li:my-1">
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!loading && !error && !plan && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaMoneyBillWave className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Plan smart, start lean</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Enter an amount above or pick a preset to see a full allocation — stock, ads, packaging, delivery, and contingency.
          </p>
        </div>
      )}
    </section>
  );
}