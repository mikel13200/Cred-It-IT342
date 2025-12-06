import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { LoginModal, RegisterModal } from './AuthModal';

export default function AuthButtons() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleRegisterSuccess = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* Login Button - Responsive */}
        <button
          onClick={() => setIsLoginOpen(true)}
          className="text-gray-700 hover:text-blue-600 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg font-medium flex items-center gap-1 sm:gap-2 transition-colors"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline text-sm md:text-base">Log In</span>
        </button>

        {/* Sign Up Button - Responsive */}
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-lg sm:rounded-xl font-medium flex items-center gap-1 sm:gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm md:text-base"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden xs:inline sm:inline">Sign Up</span>
        </button>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </>
  );
}