import React from "react";

interface StreakProgressBarProps {
  streak: number;
  roundCount: number;
  target?: number;
}

const StreakProgressBar: React.FC<StreakProgressBarProps> = ({
  streak,
  roundCount,
  target = 30,
}) => {
  return (
    <div className="flex items-center gap-4 mb-2">
      <span className="text-green-400 font-semibold">
        🔥 Daily Streak: {streak} day{streak === 1 ? "" : "s"}
      </span>
      {/* Progress Bar */}
      <div className="flex-1 h-3 bg-gray-700 rounded overflow-hidden">
        <div
          className="bg-blue-500 h-3 rounded"
          style={{ width: `${Math.min((roundCount / target) * 100, 100)}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-300 ml-2">
        {roundCount}/{target} rounds
      </span>
    </div>
  );
};

export default StreakProgressBar;
