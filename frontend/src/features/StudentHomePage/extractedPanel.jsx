"use client";

import React, { useState } from "react";

const ExtractedPanel = ({ data, accountId, onCancel }) => {
  const { school_tor = [], ocr_results = [] } = data;
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hideRequestButton, setHideRequestButton] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // active deletion/updates
  const [showConfirmPanel, setShowConfirmPanel] = useState(false); // confirmation panel
  const [showSyncCompletedPanel, setShowSyncCompletedPanel] = useState(false); // new "Completed" panel

  // Handle Cancel (close whole panel)
  const handleCancel = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/ocr/delete?account_id=${accountId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete OCR entries:", err);
      alert("Failed to delete OCR entries. Please try again.");
    }
    onCancel();
  };

  // Handle Request Creditation
  const handleRequestCreditation = async () => {
    if (isRequesting) return;
    setIsRequesting(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/request-tor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId }),
      });

      const result = await res.json();
      if (!res.ok) {
        const errorMsg = result.error || "Failed to request creditation.";
        setErrorMessage(errorMsg);
        setSuccessMessage("");

        if (errorMsg.includes("Please Fill up your Profile First")) {
          setHideRequestButton(true);
        }

        setIsRequesting(false);
        return;
      }

      setSuccessMessage("Request Creditation submitted successfully!");
      setErrorMessage("");
      setHideRequestButton(true);

      setTimeout(() => {
        onCancel();
      }, 15000);
    } catch (err) {
      console.error("Error requesting creditation:", err);
      setErrorMessage("Something went wrong. Please try again.");
      setSuccessMessage("");
      setIsRequesting(false);
    }
  };

  // Show confirmation panel (See Result)
  const handleSeeResult = () => {
    if (isProcessing) return;
    setShowConfirmPanel(true);
  };

  // Cancel confirmation panel
  const handleConfirmCancel = () => {
    setShowConfirmPanel(false);
  };

  // Continue after See Result
  const handleConfirmContinue = async () => {
    if (isProcessing) return;
    setErrorMessage("");
    setSuccessMessage("");
    setIsProcessing(true);

    try {
      // Step 1: Copy TOR entries
      const copyRes = await fetch("http://127.0.0.1:8000/api/copy-tor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId }),
      });

      if (!copyRes.ok) throw new Error("Failed to copy TOR entries");
      const copyResult = await copyRes.json();

      // Step 2: Determine remarks
      const processedData = (copyResult.data || []).map((row) => {
        const units = parseFloat(row.total_academic_units);
        let remarks = "Failed / Invalid Units";
        if (units && !isNaN(units) && units > 0 && units <= 15) {
          remarks = "Passed";
        }
        return { ...row, remarks };
      });

      const passedEntries = processedData.filter((r) => r.remarks === "Passed");
      const failedEntries = processedData.filter((r) => r.remarks === "Failed / Invalid Units");

      // Step 3: Update backend
      const updateRes = await fetch("http://127.0.0.1:8000/api/update-tor-results/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          failed_subjects: failedEntries.map((e) => e.subject_code),
          passed_subjects: passedEntries.map((e) => ({
            subject_code: e.subject_code,
            remarks: e.remarks,
          })),
        }),
      });

      if (!updateRes.ok) {
        let txt = "Failed to update TOR results";
        try {
          const j = await updateRes.json();
          if (j && j.message) txt = j.message;
        } catch (e) {}
        throw new Error(txt);
      }

      // Step 4: Show Sync Completed panel instead of summary
      setShowConfirmPanel(false);
      setShowSyncCompletedPanel(true);
      setSuccessMessage("Result processed successfully! Click 'Completed' to finalize.");
    } catch (err) {
      console.error("Error processing TOR:", err);
      setErrorMessage("Error occurred while processing results. " + (err.message || ""));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Completed button click
  const handleCompleted = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/sync-completed/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || "Failed to sync completed.");
        return;
      }

      setSummaryData(result.data);
      setShowSyncCompletedPanel(false);
      setShowSummary(true);
      setSuccessMessage("Sync completed successfully! Summary is now available.");
    } catch (err) {
      console.error(err);
      setErrorMessage("Error occurred while completing sync. " + (err.message || ""));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative">
        <h2 className="text-xl font-semibold mb-6 text-center">Extracted TOR Results</h2>

        {/* Confirmation Panel */}
        {showConfirmPanel && (
          <div className="fixed inset-0 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6 text-center z-70">
              <h3 className="text-lg font-semibold mb-4">Heads up</h3>
              <p className="mb-6">This will take some time, depending on your Internet Connection.</p>
              {errorMessage && (
                <div className="mb-4 p-3 text-red-800 bg-red-100 border border-red-300 rounded">
                  {errorMessage}
                </div>
              )}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleConfirmCancel}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmContinue}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded text-white transition ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {isProcessing ? "Processing..." : "Continue"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sync Completed Panel */}
        {showSyncCompletedPanel && (
          <div className="fixed inset-0 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-lg p-6 text-center z-70">
              <h3 className="text-lg font-semibold mb-4">Sync Completed</h3>
              <p className="mb-6">Processing is complete. Please click "Completed" to finalize the results.</p>
              <button
                onClick={handleCompleted}
                disabled={isProcessing}
                className={`px-4 py-2 rounded text-white transition ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
              >
                {isProcessing ? "Processing..." : "Completed"}
              </button>
            </div>
          </div>
        )}

        {/* Tables */}
        {!showSummary && !showConfirmPanel && !showSyncCompletedPanel && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School TOR */}
            <div>
              <h3 className="font-semibold mb-2 text-center">School TOR</h3>
              <div className="border border-gray-300 rounded max-h-[480px] overflow-y-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 border">Subject Code</th>
                      <th className="p-2 border">Prerequisites</th>
                      <th className="p-2 border">Description</th>
                      <th className="p-2 border">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {school_tor.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 border">{row.subject_code}</td>
                        <td className="p-2 border">{Array.isArray(row.prerequisite) ? row.prerequisite.join(", ") : row.prerequisite || ""}</td>
                        <td className="p-2 border">{Array.isArray(row.description) ? row.description.join(", ") : row.description || ""}</td>
                        <td className="p-2 border">{row.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* OCR Results */}
            <div>
              <h3 className="font-semibold mb-2 text-center">OCR Results</h3>
              <div className="border border-gray-300 rounded max-h-[480px] overflow-y-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-2 border">Subject Code</th>
                      <th className="p-2 border">Description</th>
                      <th className="p-2 border">Prerequisites</th>
                      <th className="p-2 border">Units</th>
                      <th className="p-2 border">Final Grade</th>
                      <th className="p-2 border">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocr_results.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 border">{row.subject_code}</td>
                        <td className="p-2 border">{row.subject_description}</td>
                        <td className="p-2 border">{row.pre_requisite}</td>
                        <td className="p-2 border">{row.total_academic_units}</td>
                        <td className="p-2 border">{row.final_grade}</td>
                        <td className="p-2 border">{row.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-3 text-green-800 bg-green-100 border border-green-300 rounded text-center">{successMessage}</div>
        )}
        {errorMessage && !showConfirmPanel && !showSyncCompletedPanel && (
          <div className="mb-4 p-3 text-red-800 bg-red-100 border border-red-300 rounded text-center">{errorMessage}</div>
        )}

        {/* Summary */}
        {showSummary && (
          <div className="mt-8">
            <h3 className="font-semibold mb-2 text-center">Summary Result</h3>
            <div className="border border-gray-300 rounded max-h-[480px] overflow-y-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 border">Subject Code</th>
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border">Units</th>
                    <th className="p-2 border">Final Grade</th>
                    <th className="p-2 border">Remark</th>
                    <th className="p-2 border">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 border">{row.subject_code}</td>
                      <td className="p-2 border">{row.subject_description}</td>
                      <td className="p-2 border">{row.total_academic_units}</td>
                      <td className="p-2 border">{row.final_grade}</td>
                      <td className="p-2 border">{row.remarks}</td>
                      <td className="p-2 border whitespace-pre-line">{row.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buttons */}
        {showSummary && (
          <div className="flex justify-center mt-4 space-x-4">
            {!hideRequestButton && (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestCreditation}
                  disabled={isRequesting}
                  className={`px-4 py-2 rounded text-white transition ${isRequesting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                >
                  {isRequesting ? "Requesting..." : "Request Accreditation"}
                </button>
              </>
            )}
          </div>
        )}

        {/* See Result Button */}
        {!showSummary && !showConfirmPanel && !showSyncCompletedPanel && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSeeResult}
              disabled={isProcessing}
              className={`px-4 py-2 rounded text-white transition ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isProcessing ? "Processing..." : "See Result"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractedPanel;
