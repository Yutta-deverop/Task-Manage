import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { ja } from 'date-fns/locale';

export function CalendarView() {
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">カレンダー</h2>
          <p className="text-zinc-500 text-sm mt-1">期限と時間軸に基づいた目標を視覚化します。</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 bg-card border border-border p-1 rounded-xl">
          <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold min-w-[100px] md:min-w-[120px] text-center uppercase tracking-widest">
            {format(currentMonth, 'yyyy年 M月', { locale: ja })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="bg-card border border-border rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 border-b border-border bg-zinc-900/50">
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <div key={day} className="py-2 md:py-4 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.deadline), day));
            return (
              <div 
                key={i}
                className={cn(
                  "min-h-[80px] md:min-h-[140px] p-1 md:p-2 border-r border-b border-border transition-colors hover:bg-zinc-900/30",
                  !isSameMonth(day, monthStart) && "opacity-20 grayscale",
                  isToday(day) && "bg-accent/5"
                )}
              >
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <span className={cn(
                    "text-[10px] md:text-xs font-mono font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full",
                    isToday(day) ? "bg-accent text-bg" : "text-zinc-500"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      className={cn(
                        "text-[8px] md:text-[9px] px-1 md:px-2 py-0.5 md:py-1 rounded border truncate font-medium",
                        task.status === 'done' 
                          ? "bg-zinc-900 border-zinc-800 text-zinc-600 line-through" 
                          : "bg-accent/10 border-accent/20 text-accent"
                      )}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[8px] text-zinc-600 pl-1">
                      他 {dayTasks.length - 3} 件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
