"use client"
import { useState, useEffect } from "react";
import ImageUpload from "../features/StudentHomePage/ActualImageUploader";
import ShowPanel from "../features/StudentHomePage/showPanel";
import Header from "../components/Header";
import SidebarDropdown from "../components/SidebarDropdown";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [userName, setUserName] = useState(""); 
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  const handleContinue = (images) => {
    setUploadedImages(images);
    setShowPanel(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header toggleSidebar={toggleSidebar} userName={userName} />
      <SidebarDropdown sidebarOpen={sidebarOpen} />
      
            {sidebarOpen && (
              <div
                className="fixed top-[80px] left-0 right-0 bottom-0 bg-black bg-opacity-50 z-10"
                onClick={toggleSidebar}
              />
            )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mt-12">
          <ImageUpload onContinue={handleContinue} />
        </div>
      </main>      
      {showPanel && (
        <ShowPanel
          images={uploadedImages}
          onClose={() => setShowPanel(false)}
        />  
      )}
    </div>
    
    
  );
}

