import React, { useState } from 'react';
import { EMOJI_PRESETS, COLORS } from '../constants';
import { HabitType } from '../types';

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: any) => void;
}

export const NewHabitModal: React.FC<NewHabitModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_PRESETS[0]);
  const [type, setType] = useState<HabitType>('helpful');
  const [color, setColor] = useState(COLORS[3]); // Emerald default
  const [unit, setUnit] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, emoji, type, color: color.text, unit: unit || undefined });
    // Reset
    setName('');
    setUnit('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-bold mb-6 text-white">New Habit</h2>
            
            <div className="mb-4">
                <label className="block text-xs text-slate-400 uppercase mb-2">Name</label>
                <input 
                    autoFocus
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Morning Jog"
                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-xs text-slate-400 uppercase mb-2">Type</label>
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        <button 
                            type="button"
                            onClick={() => setType('helpful')}
                            className={`flex-1 py-2 text-sm rounded-md transition-colors ${type === 'helpful' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                        >Helpful</button>
                        <button 
                            type="button"
                            onClick={() => setType('obstructive')}
                            className={`flex-1 py-2 text-sm rounded-md transition-colors ${type === 'obstructive' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
                        >Obstructive</button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 uppercase mb-2">Unit (Optional)</label>
                    <input 
                        type="text" 
                        value={unit} 
                        onChange={e => setUnit(e.target.value)}
                        placeholder="e.g. mins, cigs"
                        className="w-full bg-slate-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-xs text-slate-400 uppercase mb-2">Icon</label>
                <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                    {EMOJI_PRESETS.map(e => (
                        <button 
                            key={e} 
                            type="button" 
                            onClick={() => setEmoji(e)}
                            className={`flex-shrink-0 w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-slate-700 ring-2 ring-indigo-500' : 'bg-slate-800'}`}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs text-slate-400 uppercase mb-2">Color Tag</label>
                 <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                    {COLORS.map(c => (
                        <button 
                            key={c.name} 
                            type="button" 
                            onClick={() => setColor(c)}
                            className={`flex-shrink-0 w-8 h-8 rounded-full ${c.class} transition-all ${color.name === c.name ? 'ring-2 ring-white scale-110' : 'opacity-60'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={!name} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20">Create</button>
            </div>
        </form>
      </div>
    </div>
  );
};