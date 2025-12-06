import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { HomePage as StudentHome } from './pages/student';
import {
  DepartmentHome,
  DocumentPage,
  FinalDocumentPage,
   RequestPage,
} from './pages/faculty';
import { Notification, StudentRoute, FacultyRoute } from './components/common';
import { useNotification } from './hooks';
import { AuthProvider } from './context';

function AppContent() {
  const { notification, closeNotification } = useNotification();

  return (
    <>
      {/* Global Notification */}
      {notification?.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
          show={notification.show}
        />
      )}

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected Student Routes */}
        <Route 
          path="/HomePage" 
          element={
            <StudentRoute>
              <StudentHome />
            </StudentRoute>
          } 
        />
        
        {/* Protected Faculty Routes */}
        <Route 
          path="/DepartmentHome" 
          element={
            <FacultyRoute>
              <DepartmentHome />
            </FacultyRoute>
          } 
        />
        <Route 
          path="/request/:id" 
          element={
            <FacultyRoute>
              <RequestPage />
            </FacultyRoute>
          } 
        />
        <Route 
          path="/document/:id" 
          element={
            <FacultyRoute>
              <DocumentPage />
            </FacultyRoute>
          } 
        />
        <Route 
          path="/finalDocument/:id" 
          element={
            <FacultyRoute>
              <FinalDocumentPage />
            </FacultyRoute>
          } 
        />
        
        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;