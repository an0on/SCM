import React from 'react';
import { Heat } from '../../types';
import { Users, Trophy, Clock, SkipForward } from 'lucide-react';

interface HeatControlProps {
  heat: Heat;
  participants: any[];
  onHeatUpdate: () => void;
}

const HeatControl: React.FC<HeatControlProps> = ({
  heat,
  participants,
  onHeatUpdate
}) => {
  const getCurrentSkaterIndex = () => heat.current_skater_index || 0;
  const getCurrentRun = () => heat.current_run || 1;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Heat Overview</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Trophy className="h-4 w-4 mr-1" />
            Heat {heat.heat_number}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {heat.time_per_run}s per run
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {participants.length} skaters
          </div>
        </div>
      </div>

      {/* Participant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map((participant, index) => {
          const isCurrentSkater = index === getCurrentSkaterIndex();
          const hasSkated = index < getCurrentSkaterIndex() || 
                           (index === getCurrentSkaterIndex() && getCurrentRun() > 1);
          const isUpNext = index === (getCurrentSkaterIndex() + 1) % participants.length &&
                          getCurrentRun() <= heat.runs_per_skater;

          return (
            <div
              key={participant.id}
              className={`p-4 rounded-apple border-2 transition-all ${
                isCurrentSkater
                  ? 'border-green-400 bg-green-50 shadow-md'
                  : isUpNext
                  ? 'border-yellow-400 bg-yellow-50'
                  : hasSkated
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {participant.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Position #{index + 1}
                  </p>
                  {participant.stance && (
                    <p className="text-xs text-gray-500 capitalize">
                      {participant.stance} stance
                    </p>
                  )}
                  {participant.sponsors && (
                    <p className="text-xs text-gray-500 mt-1">
                      {participant.sponsors}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {isCurrentSkater && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                      Active
                    </span>
                  )}
                  {isUpNext && !isCurrentSkater && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Up Next
                    </span>
                  )}
                  {hasSkated && !isCurrentSkater && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Run Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Runs</span>
                  <span>
                    {isCurrentSkater 
                      ? `${getCurrentRun()} of ${heat.runs_per_skater}`
                      : hasSkated 
                      ? `${heat.runs_per_skater} of ${heat.runs_per_skater}`
                      : `0 of ${heat.runs_per_skater}`
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isCurrentSkater ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    style={{
                      width: `${
                        isCurrentSkater 
                          ? (getCurrentRun() / heat.runs_per_skater) * 100
                          : hasSkated 
                          ? 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heat Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-apple">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Heat Progress</h3>
            <p className="text-sm text-gray-600">
              Run {getCurrentRun()} of {heat.runs_per_skater} • 
              Skater {getCurrentSkaterIndex() + 1} of {participants.length}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(
                ((getCurrentSkaterIndex() * heat.runs_per_skater + getCurrentRun() - 1) / 
                (participants.length * heat.runs_per_skater)) * 100
              )}%
            </p>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
        </div>

        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all"
            style={{
              width: `${
                ((getCurrentSkaterIndex() * heat.runs_per_skater + getCurrentRun() - 1) / 
                (participants.length * heat.runs_per_skater)) * 100
              }%`
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-apple">
        <h4 className="text-sm font-medium text-blue-900 mb-1">Instructions</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Start each run using the "Start Run" button</li>
          <li>• Judges will be automatically notified of the active skater</li>
          <li>• Audio and haptic alerts at half-time, 20s, and 10s</li>
          <li>• Use "Next" to advance to the next skater/run</li>
        </ul>
      </div>
    </div>
  );
};

export default HeatControl;