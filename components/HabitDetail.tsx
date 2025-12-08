import React, { useState, useEffect, useMemo } from 'react';
import { Habit, HabitLog } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SparklesIcon } from './Icon';
import { analyzeHabitData } from '../services/geminiService';

interface HabitDetailProps {
  habit: Habit;
  logs: HabitLog[];
  onBack: () => void;
  onDelete: (id: string) => void;
}

export const HabitDetail: React.FC<HabitDetailProps> = ({ habit, logs, onBack, onDelete }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Group logs by day for the last 7 days
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Filter logs for this day
      const dayTotal = logs
        .filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate.getDate() === d.getDate() && 
                 logDate.getMonth() === d.getMonth() && 
                 logDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, log) => sum + log.value, 0);

      data.push({ name: dateStr, value: dayTotal, dateObj: d });
    }
    return data;
  }, [logs]);

  const totalAllTime = logs.reduce((sum, log) => sum + log.value, 0);
  const averagePerDay = Math.round(totalAllTime / (logs.length > 0 ? 30 : 1) * 10) / 10; // Rough approx for MVP

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeHabitData(habit, logs.slice(0, 50), "Recent activity");
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const chartColor = habit.type === 'good' ? '#10b981' : '#ef4444'; // Emerald vs Red

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto no-scrollbar pb-20">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950 z-20">
        <button onClick={onBack} className="text-slate-400 hover:text-white px-2 py-1">
          &larr; Back
        </button>
        <h2 className="text-lg font-bold">{habit.emoji} {habit.name}</h2>
        <button onClick={() => {
            if(confirm('Delete this habit and all history?')) onDelete(habit.id);
        }} className="text-red-500 text-sm">Delete</button>
      </div>

      <div className="p-6">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs uppercase">Total Tracked</p>
                <p className="text-2xl font-bold text-slate-100">{totalAllTime} <span className="text-xs font-normal">{habit.unit}</span></p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-xs uppercase">Total Logs</p>
                <p className="text-2xl font-bold text-slate-100">{logs.length}</p>
            </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full mb-8">
          <h3 className="text-slate-400 text-sm mb-4 uppercase tracking-wider">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColor} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-indigo-200 font-semibold">AI Insight</h3>
            </div>
            
            {analysis ? (
                <p className="text-slate-200 leading-relaxed italic">"{analysis}"</p>
            ) : (
                <p className="text-slate-500 text-sm">Get a personalized analysis of your consumption patterns.</p>
            )}

            {!analysis && (
                <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isAnalyzing ? 'Thinking...' : 'Analyze Pattern'}
                </button>
            )}
        </div>

        {/* Log History List */}
        <div className="mt-8">
            <h3 className="text-slate-400 text-sm mb-4 uppercase tracking-wider">Recent Logs</h3>
            <div className="space-y-2">
                {logs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex justify-between items-center py-3 border-b border-slate-800/50">
                        <span className="text-slate-300">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="font-mono text-slate-100 font-bold">+{log.value} {habit.unit}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
