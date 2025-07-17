import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContests } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ContestFormat, RunType, ContestPhase } from '../../types';
import { ArrowLeft, Plus, Trash2, Copy } from 'lucide-react';

interface Category {
  name: string;
  description: string;
  entry_fee: number;
  max_participants?: number;
}

interface PhaseSettings {
  phase: ContestPhase;
  runs_per_skater: number;
  time_per_run: number;
  auto_heat_threshold: number;
}

const ContestCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createContest } = useContests();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    format: 'street' as ContestFormat,
    run_type: 'single_run' as RunType,
    skaters_per_jam: 4,
    enable_head_judge: false,
  });

  const [categories, setCategories] = useState<Category[]>([
    { name: 'Pro', description: 'Professional skaters', entry_fee: 50, max_participants: 32 },
    { name: 'Amateur', description: 'Amateur skaters', entry_fee: 30 },
    { name: 'Girls', description: 'Female skaters', entry_fee: 30 },
  ]);

  const [phaseSettings, setPhaseSettings] = useState<PhaseSettings[]>([
    { phase: 'qualifier', runs_per_skater: 2, time_per_run: 60, auto_heat_threshold: 8 },
    { phase: 'semi', runs_per_skater: 2, time_per_run: 60, auto_heat_threshold: 6 },
    { phase: 'final', runs_per_skater: 3, time_per_run: 90, auto_heat_threshold: 4 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('Not authenticated');

      // Create contest
      const contest = await createContest({
        ...formData,
        created_by: user.id,
        status: 'draft',
      });

      // Create categories
      for (const category of categories) {
        await supabase.from('contest_categories').insert({
          contest_id: contest.id,
          ...category,
        });
      }

      // Create phase settings
      for (const settings of phaseSettings) {
        await supabase.from('contest_settings').insert({
          contest_id: contest.id,
          ...settings,
          scoring_system: 'best',
        });
      }

      navigate('/admin/contests');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = () => {
    setCategories([...categories, { 
      name: '', 
      description: '', 
      entry_fee: 30,
      max_participants: undefined 
    }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, updates: Partial<Category>) => {
    setCategories(categories.map((cat, i) => 
      i === index ? { ...cat, ...updates } : cat
    ));
  };

  const cloneCategory = (index: number) => {
    const category = categories[index];
    setCategories([...categories, { ...category, name: `${category.name} Copy` }]);
  };

  const updatePhaseSettings = (phase: ContestPhase, updates: Partial<PhaseSettings>) => {
    setPhaseSettings(phaseSettings.map(setting => 
      setting.phase === phase ? { ...setting, ...updates } : setting
    ));
  };

  const clonePhaseSettings = (sourcePhase: ContestPhase, targetPhase: ContestPhase) => {
    const source = phaseSettings.find(s => s.phase === sourcePhase);
    if (source) {
      updatePhaseSettings(targetPhase, {
        runs_per_skater: source.runs_per_skater,
        time_per_run: source.time_per_run,
        auto_heat_threshold: source.auto_heat_threshold,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/contests')}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Contest</h1>
            <p className="mt-1 text-gray-600">Set up a new skateboard contest</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-apple">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contest Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="e.g., Street Contest 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                placeholder="e.g., Berlin Skatepark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format *
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as ContestFormat })}
                className="input-field"
              >
                <option value="street">Street</option>
                <option value="bowl">Bowl</option>
                <option value="park">Park</option>
                <option value="vert">Vert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Run Type *
              </label>
              <select
                value={formData.run_type}
                onChange={(e) => setFormData({ ...formData, run_type: e.target.value as RunType })}
                className="input-field"
              >
                <option value="single_run">Single Run</option>
                <option value="jam">Jam</option>
              </select>
            </div>

            {formData.run_type === 'jam' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skaters per Jam
                </label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={formData.skaters_per_jam}
                  onChange={(e) => setFormData({ ...formData, skaters_per_jam: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.enable_head_judge}
                  onChange={(e) => setFormData({ ...formData, enable_head_judge: e.target.checked })}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Enable Head Judge (optional role for score finalization)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <button
              type="button"
              onClick={addCategory}
              className="btn-secondary text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-apple p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Category {index + 1}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => cloneCategory(index)}
                      className="p-1 text-gray-400 hover:text-gray-500"
                      title="Clone category"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="p-1 text-red-400 hover:text-red-500"
                        title="Remove category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={category.name}
                      onChange={(e) => updateCategory(index, { name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Pro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Fee (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={category.entry_fee}
                      onChange={(e) => updateCategory(index, { entry_fee: parseFloat(e.target.value) })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={category.max_participants || ''}
                      onChange={(e) => updateCategory(index, { 
                        max_participants: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="input-field"
                      placeholder="No limit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={category.description}
                      onChange={(e) => updateCategory(index, { description: e.target.value })}
                      className="input-field"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Phase Settings
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Master-slave config: changes apply left-to-right)
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {phaseSettings.map((settings) => (
              <div key={settings.phase} className="border border-gray-200 rounded-apple p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 capitalize">
                    {settings.phase}
                  </h3>
                  <div className="flex space-x-1">
                    {settings.phase !== 'qualifier' && (
                      <button
                        type="button"
                        onClick={() => {
                          const prevPhase = settings.phase === 'semi' ? 'qualifier' : 'semi';
                          clonePhaseSettings(prevPhase, settings.phase);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-500"
                        title="Copy from previous phase"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Runs per Skater
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={settings.runs_per_skater}
                      onChange={(e) => updatePhaseSettings(settings.phase, { 
                        runs_per_skater: parseInt(e.target.value) 
                      })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time per Run (seconds)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="180"
                      step="15"
                      value={settings.time_per_run}
                      onChange={(e) => updatePhaseSettings(settings.phase, { 
                        time_per_run: parseInt(e.target.value) 
                      })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auto Heat Threshold
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="16"
                      value={settings.auto_heat_threshold}
                      onChange={(e) => updatePhaseSettings(settings.phase, { 
                        auto_heat_threshold: parseInt(e.target.value) 
                      })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/contests')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Contest'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContestCreate;