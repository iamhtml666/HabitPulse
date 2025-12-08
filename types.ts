export type HabitType = 'good' | 'bad';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  type: HabitType;
  color: string; // Tailwind color class snippet, e.g., 'emerald-500'
  createdAt: number;
  archived: boolean;
  unit?: string; // e.g., 'cigs', 'mins', 'times'
}

export interface HabitLog {
  id: string;
  habitId: string;
  timestamp: number;
  value: number; // Defaults to 1, but allows for "5 cigarettes" or "30 minutes"
}

export interface DayAggregatedData {
  date: string; // YYYY-MM-DD
  totalValue: number;
  count: number;
}
