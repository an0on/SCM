import React, { useEffect, useState } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeRemaining,
  totalTime,
  isRunning
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 10 && timeRemaining > 0 && isRunning) {
      setIsBlinking(true);
      const blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500);

      return () => clearInterval(blinkInterval);
    } else {
      setIsBlinking(false);
    }
  }, [timeRemaining, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const percentage = (timeRemaining / totalTime) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTimerColor = () => {
    if (timeRemaining <= 10) return 'text-red-600';
    if (timeRemaining <= 20) return 'text-yellow-600';
    return 'text-gray-900';
  };

  return (
    <div className="w-full">
      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className={`text-6xl font-bold font-mono transition-colors ${getTimerColor()} ${
          isBlinking ? 'animate-pulse' : ''
        }`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="flex items-center justify-center mt-2 text-sm text-gray-600">
          <Timer className="h-4 w-4 mr-1" />
          {isRunning ? 'Running' : 'Ready'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{
            width: `${Math.max(0, (timeRemaining / totalTime) * 100)}%`
          }}
        />
      </div>

      {/* Warning Messages */}
      {timeRemaining <= 20 && timeRemaining > 10 && isRunning && (
        <div className="flex items-center justify-center space-x-2 text-yellow-600 text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          <span>20 seconds remaining</span>
        </div>
      )}

      {timeRemaining <= 10 && timeRemaining > 0 && isRunning && (
        <div className="flex items-center justify-center space-x-2 text-red-600 text-sm font-bold">
          <AlertTriangle className="h-4 w-4 animate-pulse" />
          <span>FINAL 10 SECONDS</span>
        </div>
      )}

      {timeRemaining === 0 && (
        <div className="flex items-center justify-center space-x-2 text-red-600 text-sm font-bold">
          <AlertTriangle className="h-4 w-4" />
          <span>TIME'S UP!</span>
        </div>
      )}

      {/* Time Markers */}
      <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
        <div>Half-time: {formatTime(Math.floor(totalTime / 2))}</div>
        <div>Warnings at: 20s, 10s</div>
      </div>
    </div>
  );
};

export default CountdownTimer;