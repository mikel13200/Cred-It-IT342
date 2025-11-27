"use client"
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import Header from "../components/Header";
import SidebarDropdown from "../components/SidebarDropdown";
import ImageUploader from "../components/ImageUploader";
import ImageEditorDialog from "../features/image-editor/ImageEditorDialog";
import OcrResults from "../components/OcrResults";
import { Button } from "../components/ui/button";
import API_BASE_URL from "../config/api";

import { useImageEditor } from "../features/image-editor/useImageEditor";

export default function HomePage() {
  // Basic page state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [ocrData, setOcrData] = useState(null);

  const fileInputRef = useRef(null);

  // Custom hook for image editing logic
  const editor = useImageEditor();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  const handleContinueClick = () => {
    selectedFile ? setIsDialogOpen(true) : alert("Please upload an image first.");
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    editor.setIsEditing(false);
    setPreviewUrl(originalPreviewUrl);
  };

  const handleDialogContinue = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/ocr/`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("OCR failed");

      const data = await response.json();
      console.log("OCR Response:", data);
      setOcrData(data);
      alert("Data extracted and saved!");
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to process image.");
    }
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

      <main
        className={`flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 relative z-10 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Title & Subtitle */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            CRED<span className="text-blue-600">-IT</span>
          </h1>
          <div className="space-y-2">
            <p className="text-gray-600 text-lg">To start scanning, upload an image of</p>
            <p className="text-gray-600 text-lg font-medium">your TOR (Transcript of Records)</p>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-gray-900 font-semibold text-xl mb-6 text-center">Upload Document</h2>

            <ImageUploader
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              setPreviewUrl={setPreviewUrl}
              setOriginalPreviewUrl={setOriginalPreviewUrl}
              fileInputRef={fileInputRef}
            />

            <p className="text-gray-500 text-sm mb-8 text-center">Supported formats: JPEG, PNG</p>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" className="px-8 py-2">Cancel</Button>
              <Button
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleContinueClick}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>

        {/* Image Editor Dialog */}
        {isDialogOpen && (
          <ImageEditorDialog
            {...editor}
            previewUrl={previewUrl}
            originalPreviewUrl={originalPreviewUrl}
            setPreviewUrl={setPreviewUrl}
            handleDialogClose={handleDialogClose}
            handleDialogContinue={handleDialogContinue}
            handleViewImage={() => {
              if (previewUrl) {
                const newWindow = window.open("", "_blank");
                newWindow.document.write(`
                  <title>Image Preview</title>
                  <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background-color:#2e2e2e;">
                    <img src="${previewUrl}" alt="Preview" style="max-width:95%; max-height:95vh; object-fit:contain;">
                  </body>`
                );
              }
            }}
            handleDownloadImage={() => {
              if (!previewUrl) return;
              const link = document.createElement("a");
              link.href = previewUrl;
              link.download = "edited_image.png";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            handleDoneEditing={() => {
              if (!editor.previewRef.current) {
                console.error("Preview element not found to capture.");
                return;
              }
              html2canvas(editor.previewRef.current, {
                useCORS: true,
                backgroundColor: null,
                scale: 2
              }).then((canvas) => {
                const dataUrl = canvas.toDataURL("image/png");
                setPreviewUrl(dataUrl);
                editor.setIsEditing(false);
              });
            }}
          />
        )}

        {/* OCR Results Display */}
        <OcrResults ocrData={ocrData} />
      </main>
    </div>
  );
}