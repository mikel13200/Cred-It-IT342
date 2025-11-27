"use client";
import { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

export default function ProfilePanel({ userId: propUserId, onClose }) {
  const storedUserId = localStorage.getItem("userName");
  const userId = propUserId || storedUserId;

  const [form, setForm] = useState({
    user_id: userId || "",
    name: "",
    school_name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Track whether the profile exists on backend
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setForm((prev) => ({ ...prev, user_id: userId }));

    fetch(`${API_BASE_URL}/profile/${userId}/`)
      .then((res) => {
        if (!res.ok) {
          // If 404, profile does not exist → user can create new
          setProfileExists(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setForm(data); // autofill form
          setProfileExists(true);
        } else {
          // No data, start fresh
          setForm({
            user_id: userId,
            name: "",
            school_name: "",
            email: "",
            phone: "",
          });
        }
      })
      .catch(() => {
        setProfileExists(false);
        setForm({
          user_id: userId,
          name: "",
          school_name: "",
          email: "",
          phone: "",
        });
      });
  }, [userId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // Always use POST with update_or_create in Django backend
      const res = await fetch(`${API_BASE_URL}/profile/save/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setIsError(false);
        setMessage("✅ Profile saved successfully!");
        setProfileExists(true); // mark that profile now exists
        setTimeout(() => onClose(), 1500);
      } else {
        setIsError(true);
        const data = await res.json();
        setMessage(`❌ Error saving profile: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      setIsError(true);
      setMessage("❌ Network error, please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-center">Profile</h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-center ${
              isError
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {message}
          </div>
        )}

        <form autoComplete="off" className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            name="school_name"
            value={form.school_name}
            onChange={handleChange}
            placeholder="School Name"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </form>

        <div className="flex justify-between mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {profileExists ? "Update Profile" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
