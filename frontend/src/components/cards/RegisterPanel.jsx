import React from "react";
import RegisterPanelCard from "./RegisterPanelCard";

const RegisterPanel = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="
          bg-white rounded-2xl shadow-lg p-6
          w-[400px]   /* box width */
          h-auto      /* box height adjusts to content */
          sm:w-[400px] /* bigger on larger screens */
        ">
        <RegisterPanelCard onClose={onClose} />
      </div>
    </div>
  );
};

export default RegisterPanel;