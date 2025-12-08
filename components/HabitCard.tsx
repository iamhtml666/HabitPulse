import React from 'react';
import { Habit, HabitLog } from '../types';
import { PlusIcon } from './Icon';

interface HabitCardProps {
  habit: Habit;
  todayLogs: HabitLog[];
  onLog: (habitId: string) => void;
  onClick: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, todayLogs, onLog, onClick }) => {
  const totalToday = todayLogs.reduce((acc, log) => acc + log.value, 0);

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl p-4 bg-slate-900 border border-slate-800 shadow-lg active:scale-95 transition-transform duration-100 cursor-pointer`}
      onClick={() => onClick(habit.id)}
    >
      <div className={`absolute top-0 right-0 p-2 opacity-10 ${habit.color}`}>
         {/* Background tint splash */}
         <div className="w-16 h-16 rounded-full blur-xl bg-current"></div>
      </div>

      <div className="flex justify-between items-start z-10 relative">
        <div className="flex flex-col">
          <span className="text-3xl mb-2">{habit.emoji}</span>
          <h3 className="font-semibold text-lg text-slate-100 leading-tight">{habit.name}</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{habit.type}</p>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold font-mono text-slate-100">{totalToday}</span>
          <span className="text-xs text-slate-500">{habit.unit || 'count'} today</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLog(habit.id);
          }}
          className={`rounded-full p-2 ${habit.color.replace('text-', 'bg-')} text-white hover:opacity-90 active:scale-90 transition-all shadow-md`}
          aria-label="Log habit"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
