"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/api";

export default function TrackingProgress({ userName }) {
  const [progress, setProgress] = useState(0);
  const [showTracker, setShowTracker] = useState(false);
  const [trackerData, setTrackerData] = useState([]);

  useEffect(() => {
    if (!userName) return;

    const fetchProgress = async () => {
      try {
        // 1️⃣ Check RequestTOR
        const requestRes = await axios.get(
          `${API_BASE_URL}/track_user_progress/?accountID=${userName}`
        );
        const inRequest = requestRes.data.exists;

        // 2️⃣ Check PendingRequest
        const pendingRes = await axios.get(
          `${API_BASE_URL}/pendingRequest/track_user_progress/?applicant_id=${userName}`
        );
        const inPending = pendingRes.data.exists;

        // 3️⃣ Check FinalDocuments
        const finalRes = await axios.get(
          `${API_BASE_URL}/finalDocuments/track_user_progress/?accountID=${userName}`
        );
        const inFinal = finalRes.data.exists;

        // Set progress value
        if (inFinal) setProgress(3);
        else if (inPending) setProgress(2);
        else if (inRequest) setProgress(1);
        else setProgress(0);
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    fetchProgress();
  }, [userName]);

  const handleViewTracker = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/tracker_accreditation/?account_id=${userName}`
      );
      setTrackerData(res.data);
      setShowTracker(true);
    } catch (err) {
      console.error("Error fetching tracker data:", err);
    }
  };

  const closeModal = () => setShowTracker(false);

  const steps = ["Request", "Pending", "Finalized"];

  if (progress === 0) return null; // Only show if user started a request

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mt-12">
      <h2 className="text-xl font-semibold mb-4 text-center text-indigo-700">
        Tracking Progress
      </h2>

      {/* Progress Bar */}
      <div className="relative flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 relative flex items-center justify-center">
            <div
              className={`h-3 w-full rounded-full transition-all duration-500 ${
                index < progress ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span
              className={`absolute top-4 text-sm ${
                index < progress ? "text-green-600 font-semibold" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* View Button */}
      {progress === 3 && (
        <div className="flex justify-center">
          <button
            onClick={handleViewTracker}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            View Tracker Accreditation
          </button>
        </div>
      )}

      {/* Modal */}
      {showTracker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 rounded-2xl shadow-lg p-6 relative">
            <h3 className="text-lg font-bold text-center text-indigo-700 mb-4">
              Tracker Accreditation
            </h3>

            <table className="w-full text-sm border">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Account ID</th>
                  <th className="border px-3 py-2 text-left">Subject Code</th>
                  <th className="border px-3 py-2 text-left">Description</th>
                  <th className="border px-3 py-2 text-left">Credit Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {trackerData.length > 0 ? (
                  trackerData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{item.account_id}</td>
                      <td className="border px-3 py-2">{item.subject_code}</td>
                      <td className="border px-3 py-2">{item.subject_description}</td>
                      <td
                        className={`border px-3 py-2 font-medium ${
                          item.credit_evaluation === "Accepted"
                            ? "text-green-600"
                            : item.credit_evaluation === "Denied"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {item.credit_evaluation}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-gray-500">
                      No tracker data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <button
              onClick={closeModal}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
