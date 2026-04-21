'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserShield, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function Admin() {
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [vendors, setVendors] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  const categories = [
    "Home Decor",
    "Electronics",
    "IT Services",
    "Clothing",
    "Food Supplier",
    "Construction",
    "Marketing",
    "Other"
  ];

  // ✅ GET VENDORS
  const fetchVendors = async () => {
    try {
      const res = await axios.get("http://localhost:4000/vendor/dashboard");
      setVendors(res.data.vendors);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // ✅ ADD / UPDATE
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`http://localhost:4000/vendor/update/${editId}`, {
          vendorName,
          category,
          website,
          email
        });
        setMessage("Vendor updated successfully");
      } else {
        await axios.post("http://localhost:4000/vendor/add", {
          vendorName,
          category,
          website,
          email
        });
        setMessage("Vendor added successfully");
      }

      setVendorName('');
      setCategory('');
      setWebsite('');
      setEmail('');
      setEditId(null);
      fetchVendors();

    } catch (error) {
      console.log(error);
      setMessage("Something went wrong");
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:4000/vendor/delete/${id}`);
    fetchVendors();
  };

  // ✅ EDIT
  const handleEdit = (vendor) => {
    setVendorName(vendor.vendorName);
    setCategory(vendor.category);
    setWebsite(vendor.website);
    setEmail(vendor.email);
    setEditId(vendor._id);
  };

  return (
    <section className="bg-white p-10 rounded-2xl shadow-lg mt-16 max-w-7xl mx-auto">

      {/* HEADER */}
      <h2 className="text-4xl font-extrabold mb-6 flex items-center gap-2">
        <FaUserShield className="text-teal-600" />
        Admin Dashboard
      </h2>

      {/* FORM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="Vendor Name"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          className="border p-2 rounded-lg"
        />

        {/* ✅ DROPDOWN CATEGORY */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="border p-2 rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded-lg"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-teal-600 text-white px-5 py-2 rounded-full"
      >
        {editId ? "Update Vendor" : "Add Vendor"}
      </button>

      {message && <p className="mt-3 text-green-600">{message}</p>}

      {/* ================= VENDOR LIST ================= */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-4">Vendor List</h3>

        <div className="space-y-4">
          {vendors.map((vendor) => (
            <div
              key={vendor._id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div>
                <p className="font-bold">{vendor.vendorName}</p>
                <p>{vendor.category}</p>
                <p>{vendor.website}</p>
                <p>{vendor.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(vendor)}
                  className="text-blue-600"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => handleDelete(vendor._id)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}