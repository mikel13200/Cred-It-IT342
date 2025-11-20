import React, { useState } from "react";
import { X } from "lucide-react";

const RegisterPanelCard = ({ onClose }) => {
  const [accountID, setAccountID] = useState("");
  const [accountPass, setAccountPass] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ AccountID: accountID, AccountPass: accountPass }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setAccountID(""); // clear input
        setAccountPass("");
      } else {
        setMessage(data.error || "Something went wrong");
        setAccountID(""); // clear input
        setAccountPass("");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Close button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Sign Up</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="ID"
            value={accountID}
            onChange={(e) => setAccountID(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={accountPass}
            onChange={(e) => setAccountPass(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default RegisterPanelCard;
