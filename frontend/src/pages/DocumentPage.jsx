"use client"

import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { GraduationCap, ChevronDown, ChevronUp } from "lucide-react"

export default function DocumentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [citTor, setCitTor] = useState([])
  const [applicantTor, setApplicantTor] = useState([])
  const [notification, setNotification] = useState({ message: "", type: "", show: false })
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [noteText, setNoteText] = useState("")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editData, setEditData] = useState({ id: "", subject_code: "", units: "", description: "" })
  const [statusPanel, setStatusPanel] = useState({ open: false, callback: null })
  const [filterStatus, setFilterStatus] = useState("Void")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showSchoolTor, setShowSchoolTor] = useState(false)
  const [showApplicantTor, setShowApplicantTor] = useState(true)
  const [activeTab, setActiveTab] = useState("compare")
  const closeStatusPanel = () => setStatusPanel({ open: false, callback: null })
  
  
  const promptUserForStatus = () => {
    return window.prompt("Enter status (Pending, Accepted, Denied):")
  }

  useEffect(() => {
    // Fetch profile
    fetch(`http://localhost:8000/api/profile/?user_id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) setProfile(data[0])
      })

    // Fetch School TOR
    fetch("http://localhost:8000/api/citTorContent/")
      .then((res) => res.json())
      .then(setCitTor)

    // Fetch Applicant TOR
    fetch(`http://localhost:8000/api/compareResultTOR/?account_id=${id}`)
      .then((res) => res.json())
      .then(setApplicantTor)
  }, [id])

  // school tor
  const handleEditClick = (entry) => {
    setEditData({
      id: entry.id,
      subject_code: entry.subject_code,
      units: entry.units,
      description: Array.isArray(entry.description)
        ? entry.description.join(", ")
        : entry.description,
    })
    setEditModalOpen(true)
  }

  const handleSave = () => {
  // Open StatusPanel
    setStatusPanel({  
      open: true,
      callback: async (choice) => {
        closeStatusPanel(); // close panel
        if (!choice) return; // user canceled

        try {
          // Send POST request to backend
          const res = await fetch("http://localhost:8000/api/pendingRequest/update_status_for_document/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicant_id: id,
            status: choice
          }),
        });

          const data = await res.json();

          if (!res.ok) throw new Error(data.detail || "Failed to update status");

          // Show success notification
          setNotification({
            show: true,
            message: `Status updated to "${choice}" successfully.`,
          });

          // Navigate back after short delay
          setTimeout(() => navigate("/DepartmentHome"), 1000);

        } catch (err) {
          setNotification({
            show: true,
            message: `Error updating status: ${err.message}`,
          });
        }
      },
    });
  };


  const StatusPanel = () => {
    if (!statusPanel.open) return null
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] text-center">
          <h2 className="text-lg font-semibold mb-4">Select Status</h2>
          <div className="flex justify-around mt-4">
            {["Pending", "Accepted", "Denied"].map((status) => (
              <button
                key={status}
                onClick={() => statusPanel.callback(status)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {status}
              </button>
            ))}
          </div>
          <button
            onClick={closeStatusPanel}
            className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const handleFinalize = () => {
  setNotification({
    show: true,
    message: "Are you sure you want to proceed with this decision? This will be a final action.",
    confirmCallback: async () => {
      try {
        const res = await fetch("http://localhost:8000/api/finalDocuments/finalize_request/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account_id: id })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.detail || "Failed to finalize request");

        setNotification({ show: true, message: `Request finalized successfully.`, type: "success" });

        setTimeout(() => navigate("/DepartmentHome"), 1000);
      } catch (err) {
        setNotification({ show: true, message: `Error: ${err.message}`, type: "error" });
      }
    }
  });
};

const handleEditSave = async () => {
  try {
    const res = await fetch("http://localhost:8000/api/update_cit_tor_entry/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })

    if (res.ok) {
      const updated = await res.json()
      setCitTor((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )
      setEditModalOpen(false)
    } else {
      alert("Failed to update entry.")
    }
  } catch (error) {
    console.error(error)
  }
}

  // School tor

  const closeNotification = () => setNotification({ ...notification, show: false })

    // Update Credit Evaluation
  const updateEvaluation = async (entryId, status) => {
    await fetch(`http://localhost:8000/api/update_credit_evaluation/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId, credit_evaluation: status }),
    })
    // Refresh data
    const updated = await fetch(`http://localhost:8000/api/compareResultTOR/?account_id=${id}`).then(res => res.json())
    setApplicantTor(updated)
  }

  // Save Note
  const handleSaveNote = async () => {
    if (!selectedEntry) return
    await fetch(`http://localhost:8000/api/update_note/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedEntry.id, notes: noteText }),
    })
    const updated = await fetch(`http://localhost:8000/api/compareResultTOR/?account_id=${id}`).then(res => res.json())
    setApplicantTor(updated)
    setShowNoteModal(false)
  }
  

  // Filter applicant TOR based on selected status
  const filteredApplicantTor = applicantTor.filter((entry) => {
    if (filterStatus === "All") return true
    if (filterStatus === "Void") return !entry.credit_evaluation || entry.credit_evaluation === "Void"
    return entry.credit_evaluation === filterStatus
  })

  return (
    
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Applicant Document</h1>
      </div>

      {/* Applicant Info */}
      {profile ? (
        <div className="bg-white shadow border rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Applicant Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>School:</strong> {profile.school_name}</p>
            <p><strong>User ID:</strong> {profile.user_id}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">Loading applicant info...</p>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("compare")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === "compare"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Compare View</span>
            </div>
            {activeTab === "compare" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("school")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === "school"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>School's TOR</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === "school" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {citTor.length}
              </span>
            </div>
            {activeTab === "school" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("applicant")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === "applicant"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Applicant's TOR</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === "applicant" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {applicantTor.length}
              </span>
            </div>
            {activeTab === "applicant" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "compare" && (
        <div className="grid grid-cols-2 gap-4">
        {/* School's TOR */}
        <div className="bg-white shadow border rounded-lg p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3 text-center bg-blue-50 py-2 rounded">School's TOR</h3>

          <div className="overflow-y-auto max-h-[600px] border-t">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-medium">Subject Code</th>
                  <th className="px-3 py-2 font-medium">Units</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {citTor.length > 0 ? (
                  citTor.map((subj, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{subj.subject_code}</td>
                      <td className="px-3 py-2">{subj.units}</td>
                      <td className="px-3 py-2">
                        {Array.isArray(subj.description)
                          ? subj.description.join(", ")
                          : subj.description}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleEditClick(subj)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-3 py-3 text-center text-gray-500">
                      No school TOR found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* Applicant's TOR */}
        <div className="bg-white shadow border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-gray-800 text-center bg-green-50 py-2 rounded flex-1">Applicant's TOR</h3>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              {/* Filter Dropdown */}
              <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Filter: {filterStatus}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-20">
                  {["All", "Void", "Accepted", "Denied"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status)
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filterStatus === status ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Notes Modal */}
          {showNoteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Add Note</h2>
                <textarea
                  className="w-full border rounded-md p-2 text-sm text-gray-700 mb-4"
                  rows="5"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type your note here..."
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg text-gray-800 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto overflow-y-auto max-h-[600px] border-t">
            <table className="w-full text-sm text-left table-auto">
              <thead className="bg-gray-100 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[120px]">Subject Code</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[200px]">Description</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[70px]">Units</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[90px]">Final Grade</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[400px]">Summary</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[220px]">Notes</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[150px]">Remarks</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[130px]">Credit Evaluation</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicantTor.length > 0 ? (
                  filteredApplicantTor.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 align-top">{entry.subject_code}</td>
                      <td className="px-4 py-3 align-top break-words">{entry.subject_description}</td>
                      <td className="px-4 py-3 align-top text-center">{entry.total_academic_units}</td>
                      <td className="px-4 py-3 align-top text-center">{entry.final_grade}</td>
                      <td className="px-4 py-3 align-top break-words whitespace-normal leading-relaxed">{entry.summary || "—"}</td>

                      {/* Notes section with + button */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-2">
                          <span className="break-words flex-1">{entry.notes || "—"}</span>
                          <button
                            onClick={() => {
                              setSelectedEntry(entry)
                              setNoteText(entry.notes || "")
                              setShowNoteModal(true)
                            }}
                            className="text-blue-600 font-bold text-lg hover:text-blue-800 flex-shrink-0"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top break-words">{entry.remarks || "—"}</td>

                      {/* Color-coded Credit Evaluation */}
                      <td
                        className={`px-4 py-3 align-top font-medium text-center ${
                          entry.credit_evaluation === "Accepted"
                            ? "text-green-600"
                            : entry.credit_evaluation === "Denied"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {entry.credit_evaluation || "Void"}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateEvaluation(entry.id, "Accepted")}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 whitespace-nowrap"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateEvaluation(entry.id, "Denied")}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 whitespace-nowrap"
                          >
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-3 py-3 text-center text-gray-500">
                      {applicantTor.length === 0 ? "No applicant TOR found." : `No ${filterStatus.toLowerCase()} subjects found.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleFinalize}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Finalize
            </button>
          </div>

        </div>
        </div>
      )}

      {/* School's TOR Tab */}
      {activeTab === "school" && (
        <div className="bg-white shadow border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">School's TOR</h3>
          <div className="overflow-y-auto max-h-[600px] border-t">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-medium">Subject Code</th>
                  <th className="px-3 py-2 font-medium">Units</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {citTor.length > 0 ? (
                  citTor.map((subj, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{subj.subject_code}</td>
                      <td className="px-3 py-2">{subj.units}</td>
                      <td className="px-3 py-2">
                        {Array.isArray(subj.description)
                          ? subj.description.join(", ")
                          : subj.description}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleEditClick(subj)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-3 py-3 text-center text-gray-500">
                      No school TOR found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applicant's TOR Tab */}
      {activeTab === "applicant" && (
        <div className="bg-white shadow border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Applicant's TOR</h3>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Filter: {filterStatus}
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-20">
                  {["All", "Void", "Accepted", "Denied"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status)
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        filterStatus === status ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[600px] border-t">
            <table className="w-full text-sm text-left table-auto">
              <thead className="bg-gray-100 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[140px]">Subject Code</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[250px]">Description</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[80px]">Units</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[110px]">Final Grade</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[300px]">Summary</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[250px]">Notes</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[180px]">Remarks</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[150px]">Credit Evaluation</th>
                  <th className="px-4 py-3 font-medium bg-gray-100 w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicantTor.length > 0 ? (
                  filteredApplicantTor.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 align-top">{entry.subject_code}</td>
                      <td className="px-4 py-3 align-top break-words">{entry.subject_description}</td>
                      <td className="px-4 py-3 align-top text-center">{entry.total_academic_units}</td>
                      <td className="px-4 py-3 align-top text-center">{entry.final_grade}</td>
                      <td className="px-4 py-3 align-top break-words">{entry.summary || "—"}</td>

                      {/* Notes section with + button */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 break-words flex-1">
                            {entry.note || "—"}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedEntry(entry)
                              setNoteText(entry.note || "")
                              setShowNoteModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top break-words">{entry.remarks || "—"}</td>

                      {/* Color-coded Credit Evaluation */}
                      <td
                        className={`px-4 py-3 align-top font-medium text-center ${
                          entry.credit_evaluation === "Accepted"
                            ? "text-green-600"
                            : entry.credit_evaluation === "Denied"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {entry.credit_evaluation || "Void"}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateEvaluation(entry.id, "Accepted")}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 whitespace-nowrap"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateEvaluation(entry.id, "Denied")}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 whitespace-nowrap"
                          >
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-3 py-3 text-center text-gray-500">
                      {applicantTor.length === 0 ? "No applicant TOR found." : `No ${filterStatus.toLowerCase()} subjects found.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleFinalize}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Finalize
            </button>
          </div>
        </div>
      )}
      
      <StatusPanel />
      {/* Notification Panel */}
      {notification.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] text-center">
            <p className="font-bold text-gray-800 mb-6">{notification.message}</p>
            <div className="flex justify-center gap-3">
              {notification.confirmCallback && (
                <button
                  onClick={() => notification.confirmCallback()}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Yes
                </button>
              )}
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className="px-6 py-2 bg-gray-300 rounded-lg text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit School TOR Entry</h2>

            <div className="flex flex-col gap-3">
              <label className="text-sm">
                Subject Code
                <input
                  type="text"
                  value={editData.subject_code}
                  onChange={(e) => setEditData({ ...editData, subject_code: e.target.value })}
                  className="w-full border rounded px-2 py-1 mt-1"
                />
              </label>

              <label className="text-sm">
                Units
                <input
                  type="number"
                  value={editData.units}
                  onChange={(e) => setEditData({ ...editData, units: e.target.value })}
                  className="w-full border rounded px-2 py-1 mt-1"
                />
              </label>

              <label className="text-sm">
                Description
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full border rounded px-2 py-1 mt-1 h-20 resize-none"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}