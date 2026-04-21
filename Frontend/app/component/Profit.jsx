'use client';
import React, { useMemo, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  FaMoneyBillWave, FaCalculator, FaExclamationCircle,
  FaRedo, FaChartPie, FaArrowUp, FaArrowDown, FaEquals,
  FaUndo
} from 'react-icons/fa';

function formatPKR(n) {
  const num = Number(n);
  if (!num || isNaN(num)) return '0';
  return num.toLocaleString('en-PK');
}

export default function Profit() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const [cost, setCost] = useState('');
  const [adBudget, setAdBudget] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ═══ LIVE PREVIEW — runs as user types ═══
  const preview = useMemo(() => {
    const c = Number(cost) || 0;
    const a = Number(adBudget) || 0;
    const s = Number(sellingPrice) || 0;

    if (!c || !s) return null;

    const grossProfit = s - c;
    const margin = s > 0 ? (grossProfit / s) * 100 : 0;
    const totalInvestment = c + a;

    let verdict = 'neutral';
    if (grossProfit < 0) verdict = 'loss';
    else if (margin >= 25) verdict = 'healthy';
    else if (margin >= 10) verdict = 'marginal';
    else verdict = 'thin';

    return { grossProfit, margin, totalInvestment, verdict };
  }, [cost, adBudget, sellingPrice]);

  const allFilled = cost && adBudget && sellingPrice;
  const priceWarning = preview && preview.grossProfit <= 0;

  const fetchProfitAnalysis = async () => {
    if (!allFilled) {
      setError('Please fill in all three fields.');
      return;
    }
    if (priceWarning) {
      setError('Selling price must be higher than cost to calculate profit.');
      return;
    }

    setLoading(true);
    setError('');
    setResultText('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to calculate profit.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/profit`,
        { cost, adBudget, sellingPrice },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { result } = response.data;
      if (!result) throw new Error('Invalid response format');
      setResultText(result);
    } catch (err) {
      console.error('Error fetching profit analysis:', err.response?.data || err.message);
      setError('Failed to calculate profit analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCost('');
    setAdBudget('');
    setSellingPrice('');
    setResultText('');
    setError('');
  };

  const handleNumericInput = (setter) => (e) => {
    const val = e.target.value.replace(/[^\d.]/g, '');
    setter(val);
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
              Profit &amp; ROI Calculator
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">
              Know your numbers before you sell. Enter your costs and selling price to see margins, ROI, and break-even.
            </p>
          </div>
        </div>

        {/* Input grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <MoneyInput
            label="Product Cost"
            value={cost}
            onChange={handleNumericInput(setCost)}
            placeholder="0"
          />
          <MoneyInput
            label="Ad Budget"
            value={adBudget}
            onChange={handleNumericInput(setAdBudget)}
            placeholder="0"
          />
          <MoneyInput
            label="Selling Price"
            value={sellingPrice}
            onChange={handleNumericInput(setSellingPrice)}
            placeholder="0"
            warning={priceWarning}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={fetchProfitAnalysis}
            disabled={loading || !allFilled || priceWarning}
            className="flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaCalculator /> {loading ? 'Calculating…' : 'Calculate with AI'}
          </button>
          {(cost || adBudget || sellingPrice || resultText) && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 px-5 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <FaUndo size={12} /> Reset
            </button>
          )}
        </div>

        {/* Price warning */}
        {priceWarning && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800 flex items-start gap-2">
            <FaExclamationCircle className="shrink-0 mt-0.5" />
            <span>
              Selling price (PKR {formatPKR(sellingPrice)}) is not higher than cost (PKR {formatPKR(cost)}).
              You&apos;ll lose money on every unit.
            </span>
          </div>
        )}
      </div>

      {/* ═══ LIVE PREVIEW ═══ */}
      {preview && !priceWarning && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <PreviewStat
            label="Gross Profit"
            value={`PKR ${formatPKR(preview.grossProfit)}`}
            icon={<FaArrowUp />}
            tone="emerald"
            sublabel="per unit"
          />
          <PreviewStat
            label="Profit Margin"
            value={`${preview.margin.toFixed(1)}%`}
            icon={<FaChartPie />}
            tone={
              preview.margin >= 25 ? 'emerald'
              : preview.margin >= 10 ? 'amber'
              : 'red'
            }
            sublabel={
              preview.margin >= 25 ? 'Healthy'
              : preview.margin >= 10 ? 'Marginal'
              : 'Thin'
            }
          />
          <PreviewStat
            label="Total Investment"
            value={`PKR ${formatPKR(preview.totalInvestment)}`}
            icon={<FaEquals />}
            tone="sky"
            sublabel="cost + ads"
          />
          <PreviewStat
            label="Selling Price"
            value={`PKR ${formatPKR(sellingPrice)}`}
            icon={<FaArrowDown />}
            tone="teal"
            sublabel="per unit"
          />
        </div>
      )}

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
            Crunching the numbers…
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
            <p className="font-semibold text-red-800">Couldn&apos;t calculate</p>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
            {allFilled && !priceWarning && (
              <button
                onClick={fetchProfitAnalysis}
                className="mt-2 text-red-700 hover:text-red-900 text-sm font-semibold flex items-center gap-1.5"
              >
                <FaRedo size={11} /> Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══ RESULT ═══ */}
      {!loading && !error && resultText && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FaChartPie />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              AI Breakdown
            </h3>
          </div>
          <div className="prose prose-sm sm:prose-base max-w-none text-slate-700
                          prose-headings:text-slate-900 prose-headings:font-bold
                          prose-strong:text-slate-900
                          prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline
                          prose-li:my-1">
            <ReactMarkdown>{resultText}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!loading && !error && !resultText && !preview && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mx-auto mb-3">
            <FaCalculator className="text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">Do the math before you sell</p>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Fill in all three fields above to see a live preview, then calculate the full AI breakdown with ROI and break-even.
          </p>
        </div>
      )}
    </section>
  );
}

// ════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════

function MoneyInput({ label, value, onChange, placeholder, warning }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none">
          PKR
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full pl-14 pr-3 py-3 rounded-xl border transition font-semibold text-slate-900
            focus:ring-2 outline-none
            ${warning
              ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/40 bg-amber-50/50'
              : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/40'}
          `}
        />
      </div>
    </div>
  );
}

function PreviewStat({ label, value, icon, tone, sublabel }) {
  const tones = {
    teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    icon: 'text-teal-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600' },
    sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     icon: 'text-sky-600' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: 'text-amber-600' },
    red:     { bg: 'bg-red-50',     text: 'text-red-700',     icon: 'text-red-600' },
  };
  const t = tones[tone];

  return (
    <div className={`rounded-xl p-3 sm:p-4 border border-slate-100 bg-white shadow-sm`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.bg} ${t.icon} text-xs`}>
          {icon}
        </div>
        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
          {label}
        </p>
      </div>
      <p className={`text-base sm:text-lg font-extrabold ${t.text} truncate`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[10px] text-slate-400 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}