import React, { useState } from 'react';
import {
  Header,
  SidebarStudent,
  BackgroundLayout,
} from '../../components/layout';
import { ProfilePanel } from '../../features/profile';
import {
  MultiImageUploader,
  ImagePreviewPanel,
  ImageEditorWrapper,
  ExtractedPanel,
  TorInfo,
  useTorUpload,
} from '../../features/transcript';
import { ProgressTracker } from '../../features/tracking';
import { useModal } from '../../hooks';
import { useAuthContext } from '../../context';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [editingImage, setEditingImage] = useState(null);

  // Get user from auth context instead of localStorage
  const { user } = useAuthContext();
  const userName = user?.username || '';

  const profileModal = useModal();
  const previewModal = useModal();
  const editorModal = useModal();
  const resultsModal = useModal();

  const { uploadOcr, loading, ocrResults } = useTorUpload();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleContinue = (images) => {
    setUploadedImages(images);
    previewModal.open();
  };

  const handleEditImage = (image) => {
    setEditingImage(image);
    editorModal.open();
  };

  const handleSaveEdit = (updatedImage) => {
    const newImages = uploadedImages.map((img) =>
      img.id === updatedImage.id ? updatedImage : img
    );
    setUploadedImages(newImages);
  };

  const handleProcess = async () => {
    const result = await uploadOcr(uploadedImages, userName);
    if (result) {
      previewModal.close();
      resultsModal.open();
    }
  };

  const handleCloseResults = () => {
    resultsModal.close();
    setUploadedImages([]);
  };

  return (
    <BackgroundLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="fixed inset-0 -z-10">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60"></div>

          {/* Animated mesh gradient overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-40 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-0 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Header toggleSidebar={toggleSidebar} userName={userName} />
          <SidebarStudent
            sidebarOpen={sidebarOpen}
            onOpenProfile={profileModal.open}
          />

          {sidebarOpen && (
            <div
              className="fixed top-[80px] left-0 right-0 bottom-0 bg-black bg-opacity-50 z-10"
              onClick={toggleSidebar}
            />
          )}

          <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
            {/* Welcome Section - Small and minimal */}
            <div className="mt-4 sm:mt-6">
              <TorInfo />
            </div>

            {/* Progress Tracker - Highlighted */}
            <ProgressTracker userName={userName} />

            {/* Upload Section - Enhanced and prominent */}
            <div className="mt-8 sm:mt-12">
              <MultiImageUploader onContinue={handleContinue} />
            </div>
          </main>
        </div>

        {/* Image Preview Panel */}
        <ImagePreviewPanel
          isOpen={previewModal.isOpen}
          images={uploadedImages}
          onClose={previewModal.close}
          onProcess={handleProcess}
          onEditImage={handleEditImage}
          loading={loading}
        />

        {/* Image Editor */}
        <ImageEditorWrapper
          image={editingImage}
          isOpen={editorModal.isOpen}
          onClose={editorModal.close}
          onSave={handleSaveEdit}
        />

        {/* OCR Results */}
        <ExtractedPanel
          data={ocrResults}
          accountId={userName}
          isOpen={resultsModal.isOpen}
          onClose={handleCloseResults}
        />

        {/* Profile Panel */}
        <ProfilePanel
          userId={userName}
          isOpen={profileModal.isOpen}
          onClose={profileModal.close}
        />
      </div>
    </BackgroundLayout>
  );
}
