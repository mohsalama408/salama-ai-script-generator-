import React from 'react';

interface StepCardProps {
  stepNumber: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  isComplete?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  icon,
  children,
  isActive = true,
  isComplete = false,
}) => {
  const baseClasses = "bg-gray-800/50 border rounded-xl shadow-lg p-6 transition-all duration-300";
  const stateClasses = isComplete
    ? "border-green-500/50"
    : isActive
    ? "border-cyan-500/50"
    : "border-gray-700 opacity-60";

  return (
    <div className={`${baseClasses} ${stateClasses}`}>
      <div className="flex items-center mb-4">
        <div 
          className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg mr-4 ${
            isComplete ? 'bg-green-500' : isActive ? 'bg-cyan-500' : 'bg-gray-600'
          }`}
        >
          {stepNumber}
        </div>
        <h2 className="text-2xl font-bold text-gray-200 flex items-center gap-3">
          <span className="text-cyan-400">{icon}</span>
          {title}
        </h2>
      </div>
      <div className="pl-2">{children}</div>
    </div>
  );
};

export default StepCard;
