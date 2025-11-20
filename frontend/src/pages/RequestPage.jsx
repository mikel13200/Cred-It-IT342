"use client"

import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { GraduationCap } from "lucide-react"

export default function RequestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [citTor, setCitTor] = useState([])
  const [applicantTor, setApplicantTor] = useState([])
  const [notification, setNotification] = useState({ message: "", type: "", show: false, action: null })

  useEffect(() => {
    // Fetch profile
    fetch(`http://localhost:8000/api/profile/?user_id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) setProfile(data[0])
      })

    // Fetch CIT TOR
    fetch("http://localhost:8000/api/citTorContent/")
      .then((res) => res.json())
      .then(setCitTor)

    // Fetch Applicant TOR
    fetch(`http://localhost:8000/api/compareResultTOR/?account_id=${id}`)
      .then((res) => res.json())
      .then(setApplicantTor)
  }, [id])

  const handleCancel = () => navigate("/DepartmentHome")
  const handleConfirmDeny = () => {
    confirmDeny();
    handleDeny();  // show your panel / set notification state
    // the actual deletion will be triggered from the panel buttons (Yes / No)
    };
    
  const confirmDeny = () => {
    setNotification({
      message: "Do you want to deny this request?",
      type: "deny",
      action: async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/pendingRequest/deny/${id}/`, {
            method: "DELETE",
          })

          if (res.ok) {
            closeNotification()
            navigate("/DepartmentHome")
          } else {
            const err = await res.json()
            setNotification({ message: err.error || "Error denying request.", type: "error" })
          }
        } catch (error) {
          console.error("Error denying request:", error)
          setNotification({ message: "Error denying request.", type: "error" })
        }
      },
    })
  }


  const confirmAccept = () => {
    setNotification({
      message: "Are you sure you want to accept this request?",
      type: "accept",
      show: true,
      action: handleAccept
    })
  }

  const handleDeny = async () => {
    try {
      await fetch(`http://localhost:8000/api/pendingRequest/deny/${id}/`, { method: "DELETE" })
      setNotification({ message: "Request denied successfully.", type: "success", show: true })
      setTimeout(() => navigate("/DepartmentHome"), 1500)
    } catch (error) {
      console.error("Error denying request:", error)
      setNotification({ message: "Failed to deny request.", type: "error", show: true })
    }
  }

  const handleAccept = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/pendingRequest/accept/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicant_id: id }),
      })

      if (res.ok) {
        setNotification({
          message: "Request accepted and moved to Pending Requests.",
          type: "success",
          show: true
        })
        // Auto-close panel and redirect after 1.5s
        setTimeout(() => navigate("/DepartmentHome"), 1500)
      } else {
        const err = await res.json()
        setNotification({
          message: err.error || "Error accepting request.",
          type: "error",
          show: true
        })
      }
    } catch (error) {
      console.error("Error accepting request:", error)
      setNotification({
        message: "Error accepting request.",
        type: "error",
        show: true
      })
    }
  }

  const closeNotification = () => setNotification({ ...notification, show: false })

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Applicant Request</h1>
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

      {/* Tables */}
      <div className="grid grid-cols-2 gap-6">
        {/* CIT TOR */}
        <div className="bg-white shadow border rounded-lg p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">School's TOR</h3>
          <div className="overflow-y-auto max-h-[400px] border-t">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 font-medium">Subject Code</th>
                  <th className="px-3 py-2 font-medium">Units</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {citTor.length > 0 ? (
                  citTor.map((subj, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{subj.subject_code}</td>
                      <td className="px-3 py-2">{subj.units}</td>
                      <td className="px-3 py-2">{Array.isArray(subj.description) ? subj.description.join(", ") : subj.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-3 py-3 text-center text-gray-500">No school TOR found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Applicant TOR */}
        <div className="bg-white shadow border rounded-lg p-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Applicant's TOR</h3>
          <div className="overflow-y-auto max-h-[400px] border-t">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 font-medium">Subject Code</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Units</th>
                  <th className="px-3 py-2 font-medium">Final Grade</th>
                  <th className="px-3 py-2 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {applicantTor.length > 0 ? (
                  applicantTor.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{entry.subject_code}</td>
                      <td className="px-3 py-2">{entry.subject_description}</td>
                      <td className="px-3 py-2">{entry.total_academic_units}</td>
                      <td className="px-3 py-2">{entry.final_grade}</td>
                      <td className="px-3 py-2">{entry.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-3 text-center text-gray-500">No applicant TOR found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>

        <button
          onClick={handleConfirmDeny}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Deny Request
        </button>

        <button
          onClick={confirmAccept}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Accept Request
        </button>
      </div>

      {/* Centered Panel Notification */}
      {notification.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] text-center">
            <p className="font-bold text-gray-800 mb-6">{notification.message}</p>
            {(notification.type === "deny" || notification.type === "accept") && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => { notification.action(); closeNotification() }}
                  className={`px-6 py-2 rounded-lg text-white ${notification.type === "deny" ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
                >
                  Yes
                </button>
                <button
                  onClick={closeNotification}
                  className="px-6 py-2 bg-gray-300 rounded-lg text-gray-800 hover:bg-gray-400"
                >
                  No
                </button>
              </div>
            )}
            {(notification.type === "success" || notification.type === "error") && (
              <button
                onClick={closeNotification}
                className="px-6 py-2 bg-gray-300 rounded-lg text-gray-800 hover:bg-gray-400"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
