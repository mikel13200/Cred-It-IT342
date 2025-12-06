import React, { useState, useEffect } from 'react';
import { useTracking } from '../hooks/useTracking';
import { Button, Loader } from '../../../components/common';
import TrackerModal from './TrackerModal';
import { CheckCircle, Circle, Clock } from 'lucide-react';

export default function ProgressTracker({ userName }) {
  const { progress, loading } = useTracking(userName);
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    { label: 'Request', icon: Circle },
    { label: 'Pending', icon: Clock },
    { label: 'Finalized', icon: CheckCircle },
  ];

  useEffect(() => {
    if (progress > 0) {
      setIsVisible(true);
    }
  }, [progress]);

  if (progress === 0) return null;

  return (
    <>
      <div
        className={`relative mt-6 sm:mt-8 transition-all duration-1000
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl sm:rounded-3xl blur-2xl"></div>

        {/* Main Card - Compact */}
        <div className="relative bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50">
          {/* Title - Compact */}
          <div className="text-center mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tracking Progress
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Monitor your accreditation status</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader size="sm" />
            </div>
          ) : (
            <>
              {/* Modern Step Indicators - Compact */}
              <div className="relative mb-5 sm:mb-6">
                {/* Progress Line Background */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 rounded-full mx-6"></div>

                {/* Active Progress Line */}
                <div
                  className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-6 transition-all duration-1000"
                  style={{
                    width: `calc(${((progress - 1) / (steps.length - 1)) * 100}% - 48px)`,
                  }}
                ></div>

                {/* Steps */}
                <div className="relative flex items-center justify-between px-3">
                  {steps.map((step, index) => {
                    const isCompleted = index < progress;
                    const isCurrent = index === progress - 1;
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1 relative"
                        style={{
                          transitionDelay: `${index * 150}ms`,
                        }}
                      >
                        {/* Circle Indicator - Smaller */}
                        <div
                          className={`
                            relative z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full 
                            transition-all duration-500 transform
                            ${isCompleted
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-md shadow-green-500/40 scale-105'
                              : isCurrent
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/40 scale-100 animate-pulse'
                                : 'bg-gray-200 shadow-sm'
                            }
                          `}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                          ) : isCurrent ? (
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white animate-spin" style={{ animationDuration: '3s' }} />
                          ) : (
                            <Circle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Label - Compact */}
                        <span
                          className={`
                            mt-2 text-xs sm:text-sm font-medium text-center
                            transition-all duration-500
                            ${isCompleted
                              ? 'text-green-600 font-bold'
                              : isCurrent
                                ? 'text-indigo-600 font-bold'
                                : 'text-gray-400'
                            }
                          `}
                        >
                          {step.label}
                        </span>

                        {/* Status Badge - Smaller */}
                        {isCurrent && (
                          <span className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                            In Progress
                          </span>
                        )}
                        {isCompleted && index !== progress - 1 && (
                          <span className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                            Complete
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View Button for Finalized - Compact */}
              {progress === 3 && (
                <div className="flex justify-center mt-4 sm:mt-5">
                  <Button
                    variant="success"
                    onClick={() => setShowModal(true)}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    🎉 View Accreditation Results
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <TrackerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userName={userName}
      />
    </>
  );
}