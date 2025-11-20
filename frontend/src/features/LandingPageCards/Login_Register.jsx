import React, { useState } from "react";
import {ArrowLeft, ArrowRight} from "lucide-react";

import LoginPanel from "../../components/cards/LoginPanel";
import RegisterinPanel from "../../components/cards/RegisterPanel";

const Login_Register = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const openLogin = () => {
        setIsLoginOpen(true);
        setIsRegisterOpen(false); // close Register when Login is opened
    };

    const openRegister = () => {
        setIsRegisterOpen(true);
        setIsLoginOpen(false); // close Login when Register is opened
    };

    return (
    <>
      <div className="flex gap-4">
        {/* Sign In Button */}
        <button
          onClick={openRegister}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Sign Up</span>
        </button>

        {/* Log In Button */}
        <button
          onClick={openLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <span>Log In</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Login Panel */}
      {isLoginOpen && (
        <LoginPanel onClose={() => setIsLoginOpen(false)} />
      )}

      {/* Register Panel */}
      {isRegisterOpen && (
        <RegisterinPanel onClose={() => setIsRegisterOpen(false)} />
      )}
    </>
  );
};
export default Login_Register