"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Menu, User, GraduationCap, Search, X } from "lucide-react"
import { Button } from "../components/ui/button"
import SidebarDropdown from "../components/SidebarDropdownFaculty"
import API_BASE_URL from "../config/api"

export default function DepartmentHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [requests, setRequests] = useState([])
  const [applications, setApplications] = useState([])
  const [acceptedList, setAcceptedList] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilter, setSearchFilter] = useState("all")
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [activeTab, setActiveTab] = useState("requests")
  const navigate = useNavigate()

  useEffect(() => {
    const storedName = localStorage.getItem("userName")
    if (storedName) setUserName(storedName)

    // Fetch all RequestTOR entries
    fetch(`${API_BASE_URL}/requestTOR/`)
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error("Error fetching requests:", err))

    // Fetch all PendingRequest entries
    fetch(`${API_BASE_URL}/pendingRequest/`)
      .then((res) => res.json())
      .then((data) => setApplications(data))
      .catch((err) => console.error("Error fetching applications:", err))

    // Fetch all listFinalTor entries
    fetch(`${API_BASE_URL}/finalDocuments/listFinalTor/`)
      .then((res) => res.json())
      .then((data) => setAcceptedList(data))
      .catch((err) => console.error("Error fetching accepted list:", err))
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Advanced search filter function
  const filterData = (data, idField) => {
    if (!searchQuery.trim()) return data

    return data.filter((item) => {
      const query = searchQuery.toLowerCase()
      
      switch (searchFilter) {
        case "name":
          return item.applicant_name?.toLowerCase().includes(query)
        case "id":
          return item[idField]?.toString().toLowerCase().includes(query)
        case "all":
        default:
          return (
            item.applicant_name?.toLowerCase().includes(query) ||
            item[idField]?.toString().toLowerCase().includes(query) ||
            item.status?.toLowerCase().includes(query)
          )
      }
    })
  }

  const filteredRequests = filterData(requests, "accountID")
  const filteredApplications = filterData(applications, "applicant_id")
  const filteredAccepted = filterData(acceptedList, "accountID")

  const clearSearch = () => {
    setSearchQuery("")
    setSearchFilter("all")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between relative z-30">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                CRED<span className="text-blue-600">-IT</span>
              </h1>
              <p className="text-xs text-gray-500">Credit Evaluation System</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <User className="w-5 h-5" />
          <span className="text-sm font-medium">
            {userName ? userName : "No name"}
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <SidebarDropdown sidebarOpen={sidebarOpen} />
      {sidebarOpen && (
        <div
          className="fixed top-[80px] left-0 right-0 bottom-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <main className="p-6 mt-4 space-y-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === "requests"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Requests</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === "requests" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {filteredRequests.length}
                </span>
              </div>
              {activeTab === "requests" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab("applications")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === "applications"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Applications</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === "applications" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {filteredApplications.length}
                </span>
              </div>
              {activeTab === "applications" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab("accepted")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === "accepted"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Accepted</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === "accepted" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {filteredAccepted.length}
                </span>
              </div>
              {activeTab === "accepted" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Advanced Search Bar */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, ID, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Filter by:</span>
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Fields</option>
                <option value="name">Applicant Name</option>
                <option value="id">ID (Request/Application/Account)</option>
              </select>
            </div>
          </div>
          
          {searchQuery && (
            <div className="mt-3 text-sm text-gray-600">
              Showing results for: <span className="font-semibold">"{searchQuery}"</span>
              {searchFilter !== "all" && (
                <span className="ml-2">
                  in <span className="font-semibold">{searchFilter === "name" ? "Applicant Name" : "ID"}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "requests" && (
          <section>
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 max-h-[500px] overflow-y-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">REQUEST ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">APPLICANT'S NAME</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">STATUS</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">REQUEST DATE</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.accountID} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-700">{req.accountID}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{req.applicant_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{req.status}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{new Date(req.request_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          className="bg-blue-600 text-white text-sm px-4 py-1 hover:bg-blue-700"
                          onClick={() => navigate(`/request/${req.accountID}`)}
                        >
                          OPEN REQUEST
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500 text-sm">
                      {searchQuery ? "No matching requests found." : "No requests found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </section>
        )}

        {activeTab === "applications" && (
          <section>
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 max-h-[500px] overflow-y-auto">
            <table className="w-full bg-white table-auto">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[15%]">APPLICATION ID</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[30%]">APPLICANT'S NAME</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[15%]">STATUS</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[18%]">REQUEST DATE</th>
                  <th className="text-center py-3 px-6 text-sm font-semibold text-gray-600 w-[22%]">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 text-sm text-gray-700 font-medium">{app.applicant_id}</td>
                      <td className="py-3 px-6 text-sm text-gray-700 font-medium">{app.applicant_name}</td>
                      <td className="py-3 px-6 text-sm text-gray-700">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          app.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                          app.status === "Accepted" ? "bg-blue-100 text-blue-700" :
                          app.status === "Denied" ? "bg-red-100 text-red-700" :
                          app.status === "Finalized" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-700">{new Date(app.request_date).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-center">
                        <Button
                          className="bg-blue-600 text-white text-sm px-4 py-1 hover:bg-blue-700"
                          onClick={() => navigate(`/document/${app.applicant_id}`)}
                        >
                          VIEW/EDIT DOCUMENT
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500 text-sm">
                      {searchQuery ? "No matching applications found." : "No applications found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </section>
        )}

        {activeTab === "accepted" && (
          <section>
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200 max-h-[500px] overflow-y-auto">
            <table className="w-full bg-white table-auto">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[12%]">ACCOUNT ID</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[25%]">APPLICANT'S NAME</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[15%]">STATUS</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[16%]">REQUEST DATE</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 w-[16%]">ACCEPTED DATE</th>
                  <th className="text-center py-3 px-6 text-sm font-semibold text-gray-600 w-[16%]">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccepted.length > 0 ? (
                  filteredAccepted.map((item) => (
                    <tr key={item.accountID} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6 text-sm text-gray-700 font-medium">{item.accountID}</td>
                      <td className="py-3 px-6 text-sm text-gray-700 font-medium">{item.applicant_name}</td>
                      <td className="py-3 px-6 text-sm text-gray-700">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                          item.status === "Accepted" ? "bg-blue-100 text-blue-700" :
                          item.status === "Denied" ? "bg-red-100 text-red-700" :
                          item.status === "Finalized" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(item.request_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {item.accepted_date ? new Date(item.accepted_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          className="bg-blue-600 text-white text-sm px-4 py-1 hover:bg-blue-700"
                          onClick={() => navigate(`/finalDocument/${item.accountID}`)}
                        >
                          VIEW
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500 text-sm">
                      {searchQuery ? "No matching accepted entries found." : "No accepted entries found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </section>
        )}
      </main>
    </div>
  )
}
