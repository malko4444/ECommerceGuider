'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { FaChartLine, FaCalculator, FaMoneyBillWave } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

export default function Profit() {
  const [cost, setCost] = useState('');
  const [adBudget, setAdBudget] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchProfitAnalysis = async () => {
    if (!cost || !adBudget || !sellingPrice) return;
    setLoading(true);
    setError('');
    setResultText('');
    const token = localStorage.getItem("token"); // 🔑 get token
      console.log("the toen ", token);
      
      if (!token) {
        throw new Error("No token found. Please login again.");
      }else{
        console.log("the token found ", token);
      }

    try {
      console.log("the base url ", API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/api/profit`, {
        cost,
        adBudget,
        sellingPrice,
      },
    {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ attach token
          },
        });

      const { result } = response.data;
      if (!result) throw new Error('Invalid response format');

      setResultText(result);
      console.log('Profit Analysis:', result);
    } catch (err) {
      console.error('Error fetching profit analysis:', err);
      setError('Failed to calculate profit analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaMoneyBillWave className="text-teal-600" />
        Profit & ROI Calculator
      </h2>

      {/* Input Fields */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <input
          type="number"
          placeholder="Product Cost (PKR)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <input
          type="number"
          placeholder="Ad Budget (PKR)"
          value={adBudget}
          onChange={(e) => setAdBudget(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <input
          type="number"
          placeholder="Selling Price (PKR)"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Button */}
      <button
        onClick={fetchProfitAnalysis}
        className="bg-teal-600 text-white px-5 py-3 rounded-full hover:bg-teal-700 transition flex items-center gap-2 mb-6"
      >
        <FaCalculator /> Calculate
      </button>

      {/* Feedback */}
      {loading && <p className="text-teal-500 font-semibold mb-4">Calculating profit analysis...</p>}
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      {/* Result */}
      {!loading && !error && resultText && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-md prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800">
                  <ReactMarkdown>{resultText}</ReactMarkdown>
                </div>
      )}
    </section>
  );
}
