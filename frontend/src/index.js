import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DepartmentHome from "./pages/DepartmentHome";
import RequestPage from "./pages/RequestPage";
import ProfilePage from "./pages/ProfilePanel";   
import DocumentPage from "./pages/DocumentPage";
import FinalDocumentPage from "./pages/FinalDocumentPage";
//import AboutUsPage from "./pages/AboutUsPage"; 

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/LandingPage", element: <LandingPage /> }, 
  { path: "/HomePage", element: <HomePage /> },
  { path: "/DepartmentHome", element: <DepartmentHome /> },
  { path: "/ProfilePage", element: <ProfilePage /> }, 
  { path: "/request/:id", element: <RequestPage /> },  
  { path: "/document/:id", element: <DocumentPage />},
  { path: "/finalDocument/:id", element: <FinalDocumentPage /> },
  
  //{ path: "/AboutUsPage", element: <AboutUsPage /> },  
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
