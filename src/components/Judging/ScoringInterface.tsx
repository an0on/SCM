import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Heat, Score } from '../../types';
import { 
  RotateCcw, 
  Check, 
  AlertCircle,
  Timer,
  User
} from 'lucide-react';

interface ScoringInterfaceProps {
  heat: Heat;
  currentSkater: string | null;
  judgeId: string;
  scores: Score[];
  onScoreSubmit: () => void;
}

const ScoringInterface: React.FC<ScoringInterfaceProps> = ({
  heat,
  currentSkater,
  judgeId,
  scores,
  onScoreSubmit
}) => {
  const [currentScore, setCurrentScore] = useState<string>('');
  const [tempScore, setTempScore] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [skaterName, setSkaterName] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (currentSkater) {
      fetchSkaterName();
      resetForm();
    }
  }, [currentSkater]);

  useEffect(() => {
    // Check if we already scored this run
    if (currentSkater && heat.current_run) {
      const existingScore = scores.find(s => 
        s.skater_id === currentSkater && 
        s.judge_id === judgeId && 
        s.run_number === heat.current_run
      );
      
      if (existingScore) {
        setCurrentScore(existingScore.score.toString());
        setNotes(existingScore.notes || '');
      }
    }
  }, [currentSkater, heat.current_run, scores, judgeId]);

  const fetchSkaterName = async () => {
    if (!currentSkater) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', currentSkater)
        .single();

      if (error) throw error;
      setSkaterName(data.name);
    } catch (error) {
      console.error('Error fetching skater name:', error);
      setSkaterName('Unknown Skater');
    }
  };

  const resetForm = () => {
    setCurrentScore('');
    setTempScore('');
    setNotes('');
  };

  const handleNumberInput = (digit: string) => {
    if (digit === '.') {
      if (!tempScore.includes('.')) {
        setTempScore(tempScore + '.');
      }
    } else if (digit === 'clear') {
      setTempScore('');
    } else {
      const newScore = tempScore + digit;
      const numValue = parseFloat(newScore);
      
      if (numValue >= 0 && numValue <= 10) {
        setTempScore(newScore);
      }
    }
  };

  const handleUndo = () => {
    setTempScore('');
    setCurrentScore('');
  };

  const handlePreview = () => {
    const score = parseFloat(tempScore);
    if (score >= 0 && score <= 10) {
      setCurrentScore(tempScore);
    }
  };

  const handleSubmit = async () => {
    if (!currentSkater || !currentScore || !heat.current_run) {
      return;
    }

    const score = parseFloat(currentScore);
    if (score < 0 || score > 10) {
      return;
    }

    setSubmitting(true);
    try {
      // Check if score already exists for this run
      const existingScore = scores.find(s => 
        s.skater_id === currentSkater && 
        s.judge_id === judgeId && 
        s.run_number === heat.current_run
      );

      if (existingScore) {
        // Update existing score
        await supabase
          .from('scores')
          .update({
            score,
            notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingScore.id);
      } else {
        // Create new score
        await supabase
          .from('scores')
          .insert({
            heat_id: heat.id,
            skater_id: currentSkater,
            judge_id: judgeId,
            run_number: heat.current_run,
            score,
            notes,
            is_final: false
          });
      }

      onScoreSubmit();
      setTempScore('');
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentSkater) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <Timer className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Waiting for Active Skater</h3>
          <p className="mt-1 text-sm text-gray-500">
            The commentator will start the next run shortly.
          </p>
        </div>
      </div>
    );
  }

  const numberPad = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', 'clear']
  ];

  const currentScoreValue = parseFloat(currentScore);
  const isValidScore = currentScoreValue >= 0 && currentScoreValue <= 10;

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{skaterName}</h2>
            <p className="text-sm text-gray-600">
              Run {heat.current_run} of {heat.runs_per_skater} • {heat.time_per_run}s
            </p>
          </div>
        </div>

        {/* Score Display */}
        <div className="bg-gray-50 rounded-apple p-6 mb-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Score</p>
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {currentScore || tempScore || '0.0'}
            </div>
            <p className="text-sm text-gray-500">0.0 - 10.0 scale</p>
          </div>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {numberPad.flat().map((value) => (
            <button
              key={value}
              onClick={() => handleNumberInput(value)}
              className={`h-16 text-xl font-semibold rounded-apple transition-colors ${
                value === 'clear'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {value === 'clear' ? 'C' : value}
            </button>
          ))}
        </div>

        {/* Preview and Undo */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={handlePreview}
            disabled={!tempScore}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Score
          </button>
          <button
            onClick={handleUndo}
            disabled={!currentScore && !tempScore}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Undo
          </button>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Add private notes about this run..."
          />
        </div>

        {/* Submit */}
        <div className="space-y-3">
          {!isValidScore && currentScore && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Score must be between 0.0 and 10.0</span>
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={!isValidScore || submitting}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Submit Score
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoringInterface;