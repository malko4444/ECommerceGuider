'use client'
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  FaUserShield, FaPlus, FaTrash, FaEdit, FaSearch,
  FaStore, FaTags, FaGlobe, FaEnvelope, FaTimes,
  FaCheckCircle, FaExclamationTriangle, FaSignOutAlt
} from 'react-icons/fa';

// Color palette per category — stays within the teal-family theme
// but lets the eye scan the list faster.
const CATEGORY_STYLES = {
  "Home Decor":    "bg-amber-50  text-amber-700  border-amber-200",
  "Electronics":   "bg-sky-50    text-sky-700    border-sky-200",
  "IT Services":   "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Clothing":      "bg-pink-50   text-pink-700   border-pink-200",
  "Food Supplier": "bg-orange-50 text-orange-700 border-orange-200",
  "Construction": "bg-stone-100 text-stone-700  border-stone-200",
  "Marketing":     "bg-purple-50 text-purple-700 border-purple-200",
  "Other":         "bg-slate-50  text-slate-700  border-slate-200",
};

const CATEGORIES = [
  "Home Decor", "Electronics", "IT Services", "Clothing",
  "Food Supplier", "Construction", "Marketing", "Other"
];

export default function Admin() {
  // ─── form state ───────────────────────────────
  // ─
  const [loggingOut, setLoggingOut] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [editId, setEditId] = useState(null);

  // ─── list + ui state ───────────────────────────
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // success | error

  // ─── search + filter ───────────────────────────
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // ════════════════════════════════════════════════
  // API HELPERS
  // ════════════════════════════════════════════════

const handleLogout = async () => {
  if (!window.confirm("Sign out of the admin console?")) return;
  try {
    setLoggingOut(true);
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/logout`,
      {},
      { withCredentials: true }
    );
    localStorage.removeItem('admin');
    localStorage.removeItem('rememberAdminEmail');
    window.location.href = '/admin/login';
  } catch (error) {
    console.log(error);
    showMessage("Logout failed. Please try again.", 'error');
    setLoggingOut(false);
  }
};
  const fetchVendors = async () => {
    try {
      setLoading(true);
       
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/dashboard`, { withCredentials: true });
      setVendors(res.data.vendors || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const resetForm = () => {
    setVendorName(''); setCategory(''); setWebsite(''); setEmail(''); setPhone('');
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!vendorName || !category || !website || !email || !phone) {
      showMessage("Please fill in all fields.", 'error');
      return;
    }
    try {
      setSubmitting(true);
      if (editId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/update/${editId}`, {
          vendorName, category, website, email, phone
        }, { withCredentials: true });
        showMessage("Vendor updated successfully.");
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/add`, {
          vendorName, category, website, email, phone
        }, { withCredentials: true }  );
        showMessage("Vendor added successfully.");
      }
      resetForm();
      fetchVendors();
    } catch (error) {
      console.log(error);
      showMessage("Something went wrong. Please try again.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor? This cannot be undone.")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/vendor/delete/${id}`, { withCredentials: true });
      showMessage("Vendor deleted.");
      fetchVendors();
    } catch (error) {
      showMessage("Failed to delete vendor.", 'error');
    }
  };

  const handleEdit = (vendor) => {
    setVendorName(vendor.vendorName);
    setCategory(vendor.category);
    setWebsite(vendor.website);
    setEmail(vendor.email);
    setPhone(vendor.phone);
    setEditId(vendor._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ════════════════════════════════════════════════
  // DERIVED
  // ════════════════════════════════════════════════
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        v.vendorName?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.website?.toLowerCase().includes(q);
      const matchesCat = !filterCategory || v.category === filterCategory;
      return matchesSearch && matchesCat;
    });
  }, [vendors, search, filterCategory]);

  const uniqueCategories = new Set(vendors.map(v => v.category)).size;

  // ════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ═══ HEADER ═══ */}
       {/* ═══ HEADER ═══ */}
<div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/30">
      <FaUserShield className="text-white text-2xl" />
    </div>
    <div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Admin Dashboard
      </h1>
      <p className="text-slate-500 text-sm mt-0.5">
        Manage your vendor directory — add, edit, and organize trusted suppliers.
      </p>
    </div>
  </div>

  <button
    onClick={handleLogout}
    disabled={loggingOut}
    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 font-semibold text-sm shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loggingOut ? (
      <>
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Signing out…
      </>
    ) : (
      <>
        <FaSignOutAlt size={13} /> Sign out
      </>
    )}
  </button>
</div>

        {/* ═══ STATS ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<FaStore />} label="Total Vendors"      value={vendors.length}        tone="teal"   />
          <StatCard icon={<FaTags />}  label="Categories Used"    value={uniqueCategories}      tone="purple" />
          <StatCard icon={<FaCheckCircle />} label="Filtered Results" value={filteredVendors.length} tone="amber" />
        </div>

        {/* ═══ FORM CARD ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-7 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${editId ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'}`}>
                {editId ? <FaEdit /> : <FaPlus />}
              </span>
              {editId ? "Edit Vendor" : "Add New Vendor"}
            </h2>
            {editId && (
              <button
                onClick={resetForm}
                className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <FaTimes size={12} /> Cancel edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Vendor Name">
              <input
                type="text" placeholder="e.g. ABC Traders"
                value={vendorName} onChange={(e) => setVendorName(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Category">
              <select
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="input bg-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </Field>

            <Field label="Website">
              <input
                type="text" placeholder="https://example.com"
                value={website} onChange={(e) => setWebsite(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Email">
              <input
                type="email" placeholder="vendor@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Phone">
              <input
                type="text" placeholder="123-456-7890"
                value={phone} onChange={(e) => setPhone(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md shadow-teal-600/20 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {editId ? <FaEdit /> : <FaPlus />}
              {submitting ? "Saving…" : editId ? "Update Vendor" : "Add Vendor"}
            </button>
          </div>

          {/* inline toast */}
          {message && (
            <div className={`mt-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border ${
              messageType === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {messageType === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
              {message}
            </div>
          )}
        </div>

        {/* ═══ SEARCH + FILTER BAR ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text" placeholder="Search by name, email, or website…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 pl-10 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
          </div>
          <select
            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-slate-200 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white sm:w-56"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* ═══ VENDOR LIST ═══ */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            Vendor Directory
            <span className="text-slate-400 font-normal text-base ml-2">
              ({filteredVendors.length})
            </span>
          </h3>
        </div>

        {loading ? (
          <EmptyState loading />
        ) : filteredVendors.length === 0 ? (
          <EmptyState
            title={vendors.length === 0 ? "No vendors yet" : "No matches found"}
            subtitle={vendors.length === 0
              ? "Add your first vendor using the form above."
              : "Try a different search term or clear the category filter."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor._id}
                vendor={vendor}
                onEdit={() => handleEdit(vendor)}
                onDelete={() => handleDelete(vendor._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* shared input styling (Tailwind @apply fallback via a style tag) */}
      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          outline: none;
          transition: all 0.15s;
        }
        .input:focus {
          border-color: rgb(20 184 166);
          box-shadow: 0 0 0 2px rgb(20 184 166 / 0.25);
        }
      `}</style>
    </section>
  );
}

// ════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, tone = "teal" }) {
  const tones = {
    teal:   "bg-teal-50   text-teal-600",
    purple: "bg-purple-50 text-purple-600",
    amber:  "bg-amber-50  text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones[tone]}`}>
          {icon}
        </div>
        <div>
          <p className="text-slate-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function VendorCard({ vendor, onEdit, onDelete }) {
  const catStyle = CATEGORY_STYLES[vendor.category] || CATEGORY_STYLES.Other;
  const websiteHref = vendor.website?.startsWith('http')
    ? vendor.website
    : `https://${vendor.website}`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 hover:-translate-y-0.5 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {vendor.vendorName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate">{vendor.vendorName}</p>
            <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catStyle}`}>
              {vendor.category}
            </span>
          </div>
        </div>

        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
            title="Edit"
          ><FaEdit size={12} /></button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition"
            title="Delete"
          ><FaTrash size={12} /></button>
        </div>
      </div>

      <div className="pl-14 space-y-1.5 text-sm">
        <a
          href={websiteHref} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition truncate"
        >
          <FaGlobe className="text-slate-400 shrink-0" size={12} />
          <span className="truncate">{vendor.website}</span>
        </a>
        <a
          href={`mailto:${vendor.email}`}
          className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition truncate"
        >
          <FaEnvelope className="text-slate-400 shrink-0" size={12} />
          <span className="truncate">{vendor.email}</span>
        </a>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="text-slate-400 shrink-0">📞</span>
          <span className="truncate">{vendor.phone}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ loading, title, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
      {loading ? (
        <>
          <div className="animate-spin w-9 h-9 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-3 font-medium">Loading vendors…</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FaStore className="text-slate-400 text-2xl" />
          </div>
          <p className="text-slate-800 font-semibold">{title}</p>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </>
      )}
    </div>
  );
}