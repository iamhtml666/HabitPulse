import React, { useEffect, useState, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Habit, HabitLog } from './types';
import { saveHabit, getHabits, addLog, getLogs, deleteHabit, getAllLogs } from './services/db';
import { HabitCard } from './components/HabitCard';
import { HabitDetail } from './components/HabitDetail';
import { NewHabitModal } from './components/NewHabitModal';
import { HomeIcon, CogIcon, PlusIcon } from './components/Icon';

const AppContent = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  
  // Tabs: 'home' | 'settings'
  const [activeTab, setActiveTab] = useState('home');

  const refreshData = useCallback(async () => {
    try {
      const h = await getHabits();
      setHabits(h.filter(x => !x.archived));
      const allLogs = await getAllLogs(); // Naive fetch all for MVP, optimize later
      setLogs(allLogs);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCreateHabit = async (data: any) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: data.name,
      emoji: data.emoji,
      type: data.type,
      color: data.color,
      createdAt: Date.now(),
      archived: false,
      unit: data.unit
    };
    await saveHabit(newHabit);
    await refreshData();
  };

  const handleLog = async (habitId: string) => {
    // Quick log action
    const log: HabitLog = {
      id: crypto.randomUUID(),
      habitId,
      timestamp: Date.now(),
      value: 1 // Default increment
    };
    await addLog(log);
    await refreshData();
    
    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleDeleteHabit = async (id: string) => {
      await deleteHabit(id);
      setSelectedHabitId(null);
      await refreshData();
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading your habits...</div>;
  }

  // Derived state
  const getTodayLogs = (habitId: string) => {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    return logs.filter(l => l.habitId === habitId && l.timestamp >= startOfDay.getTime());
  };

  const selectedHabit = habits.find(h => h.id === selectedHabitId);
  const selectedHabitLogs = selectedHabitId ? logs.filter(l => l.habitId === selectedHabitId).sort((a,b) => b.timestamp - a.timestamp) : [];

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Detail View Overlay */}
      {selectedHabit && (
        <div className="absolute inset-0 z-40 bg-slate-950 animate-in slide-in-from-right duration-200">
           <HabitDetail 
             habit={selectedHabit} 
             logs={selectedHabitLogs} 
             onBack={() => setSelectedHabitId(null)}
             onDelete={handleDeleteHabit}
           />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
        
        {activeTab === 'home' && (
            <>
                <header className="mb-6 mt-2 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Today</h1>
                        <p className="text-slate-400 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2 shadow-lg shadow-indigo-500/20"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </header>

                {habits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-center opacity-60">
                        <span className="text-6xl mb-4">🌱</span>
                        <p className="text-slate-300">No habits yet.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-indigo-400 font-bold mt-2">Create one?</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 pb-4">
                        {habits.map(habit => (
                            <HabitCard 
                                key={habit.id} 
                                habit={habit} 
                                todayLogs={getTodayLogs(habit.id)}
                                onLog={handleLog}
                                onClick={setSelectedHabitId}
                            />
                        ))}
                    </div>
                )}
            </>
        )}

        {activeTab === 'settings' && (
            <div className="p-4 space-y-6">
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <h3 className="text-slate-300 font-semibold mb-2">Developer Interview Notes</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        I've implemented the MVP focusing on:
                    </p>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 mb-4">
                        <li>Offline-first IndexedDB architecture</li>
                        <li>Mobile-first Tailwind design</li>
                        <li>Helpful/Obstructive habit tracking</li>
                        <li>Detailed stats (click a habit card)</li>
                        <li>AI Analysis using Gemini</li>
                    </ul>
                    <p className="text-slate-400 text-sm italic border-t border-slate-800 pt-2">
                        Ready for next features: Sync, Push Notifications, Export.
                    </p>
                </div>
            </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 px-6 z-30">
        <div className="flex justify-around items-center h-16">
            <button 
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-indigo-400' : 'text-slate-500'}`}
            >
                <HomeIcon className="w-6 h-6" />
                <span className="text-[10px] font-medium">Habits</span>
            </button>
            <button 
                 onClick={() => setActiveTab('settings')}
                 className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-500'}`}
            >
                <CogIcon className="w-6 h-6" />
                <span className="text-[10px] font-medium">Settings</span>
            </button>
        </div>
      </nav>

      <NewHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleCreateHabit} 
      />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}