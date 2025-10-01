'use client';
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaMoneyBillWave, FaSearchDollar } from 'react-icons/fa';

export default function Budget() {
  const [budgetInput, setBudgetInput] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBudgetPlan = async () => {
    if (!budgetInput.trim()) return;
    setLoading(true);
    setError('');
    setPlan('');

    try {
      const token = localStorage.getItem("token"); // 🔑 get token
      console.log("the toen ", token);
      
      
      const response = await axios.post(
  "http://localhost:4000/api/budget",
  { budget: budgetInput.trim() },  // body
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅ proper headers
    },
  }
);


      const planText = response.data?.plan;
      if (!planText) throw new Error('No plan returned from server.');
      setPlan(planText);
    } catch (err) {
      console.error('Error fetching budget plan:', err);
      setError('Failed to load budget plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <FaMoneyBillWave className="text-teal-600" />
        Budget Planner for Online Business
      </h2>

      {/* Input and Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Enter your budget in PKR"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchBudgetPlan()}
          className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={fetchBudgetPlan}
          className="bg-teal-600 text-white px-3 py-2 rounded-full hover:bg-teal-700 transition flex items-center gap-2"
        >
          <FaSearchDollar /> Generate
        </button>
      </div>

      {/* Feedback */}
      {loading && <p className="text-teal-500 font-semibold mb-4">Generating plan...</p>}
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      {/* Markdown Result */}
      {!loading && !error && plan && (
        <div className="bg-gray-50 p-6 rounded-xl shadow-md prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800">
          <ReactMarkdown>{plan}</ReactMarkdown>
        </div>
      )}
    </section>
  );
}
