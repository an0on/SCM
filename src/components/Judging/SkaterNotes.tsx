import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Score } from '../../types';
import { FileText, Save, User } from 'lucide-react';

interface SkaterNotesProps {
  heatId: string;
  skaterId: string | null;
  judgeId: string;
}

const SkaterNotes: React.FC<SkaterNotesProps> = ({ heatId, skaterId, judgeId }) => {
  const [notes, setNotes] = useState<string>('');
  const [skaterName, setSkaterName] = useState<string>('');
  const [skaterInfo, setSkaterInfo] = useState<any>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (skaterId) {
      fetchSkaterInfo();
      fetchSkaterScores();
    } else {
      resetNotes();
    }
  }, [skaterId, heatId]);

  const fetchSkaterInfo = async () => {
    if (!skaterId) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', skaterId)
        .single();

      if (error) throw error;
      setSkaterInfo(data);
      setSkaterName(data.name);
    } catch (error) {
      console.error('Error fetching skater info:', error);
      setSkaterName('Unknown Skater');
    }
  };

  const fetchSkaterScores = async () => {
    if (!skaterId || !heatId) return;

    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('heat_id', heatId)
        .eq('skater_id', skaterId)
        .eq('judge_id', judgeId)
        .order('run_number', { ascending: true });

      if (error) throw error;
      setScores(data || []);

      // Load notes from the most recent score
      if (data && data.length > 0) {
        const latestScore = data[data.length - 1];
        setNotes(latestScore.notes || '');
      } else {
        setNotes('');
      }
    } catch (error) {
      console.error('Error fetching skater scores:', error);
    }
  };

  const resetNotes = () => {
    setNotes('');
    setSkaterName('');
    setSkaterInfo(null);
    setScores([]);
  };

  const saveNotes = async () => {
    if (!skaterId || !heatId) return;

    setSaving(true);
    try {
      // Update the most recent score with the notes
      const latestScore = scores[scores.length - 1];
      if (latestScore) {
        await supabase
          .from('scores')
          .update({ notes })
          .eq('id', latestScore.id);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!skaterId) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Skater</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click on a participant to view their info and add notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{skaterName}</h3>
            <p className="text-sm text-gray-600">Skater Information</p>
          </div>
        </div>

        {/* Skater Details */}
        {skaterInfo && (
          <div className="bg-gray-50 rounded-apple p-4 mb-4">
            <div className="space-y-2 text-sm">
              {skaterInfo.stance && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Stance:</span>
                  <span className="font-medium capitalize">{skaterInfo.stance}</span>
                </div>
              )}
              {skaterInfo.sponsors && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sponsors:</span>
                  <span className="font-medium text-right">{skaterInfo.sponsors}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Previous Scores */}
        {scores.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">My Scores</h4>
            <div className="flex space-x-2">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-800 rounded-apple font-semibold"
                >
                  {score.score}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Private Notes
          </label>
          <button
            onClick={saveNotes}
            disabled={saving}
            className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 inline mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={8}
          className="input-field"
          placeholder="Add private notes about this skater's performance..."
        />
        
        <p className="text-xs text-gray-500 mt-2">
          These notes are private and only visible to you. They will be saved automatically.
        </p>
      </div>

      {/* Quick Notes */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Notes</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Technical', 'Creative', 'Consistent', 'Big Air', 
            'Clean Landing', 'Style', 'Flow', 'Difficult'
          ].map((tag) => (
            <button
              key={tag}
              onClick={() => setNotes(notes + (notes ? ', ' : '') + tag)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkaterNotes;