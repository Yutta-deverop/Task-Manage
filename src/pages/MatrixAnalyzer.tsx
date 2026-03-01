import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { cn } from '../lib/utils';
import { AlertCircle, Zap, Clock, BookOpen, ArrowRight, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { addDays } from 'date-fns';

export function MatrixAnalyzer() {
  const { updateTask } = useTaskStore();
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];

  const now = new Date();
  const isUrgent = (deadline: string) => {
    const d = new Date(deadline);
    const diff = d.getTime() - now.getTime();
    return diff < 3 * 24 * 60 * 60 * 1000; // 3 days
  };

  const moveTask = async (taskId: string, targetQuadrant: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let updates: any = {};
    switch (targetQuadrant) {
      case 'q1': // Urgent & Important
        updates.priority = 1;
        if (!isUrgent(task.deadline)) updates.deadline = addDays(now, 1).toISOString();
        break;
      case 'q2': // Not Urgent & Important
        updates.priority = 1;
        if (isUrgent(task.deadline)) updates.deadline = addDays(now, 7).toISOString();
        break;
      case 'q3': // Urgent & Not Important
        updates.priority = 2;
        if (!isUrgent(task.deadline)) updates.deadline = addDays(now, 1).toISOString();
        break;
      case 'q4': // Not Urgent & Not Important
        updates.priority = 3;
        if (isUrgent(task.deadline)) updates.deadline = addDays(now, 14).toISOString();
        break;
    }
    await updateTask(taskId, updates);
  };

  const quadrants = [
    {
      id: 'q1',
      title: '即実行',
      subtitle: '緊急 ＆ 重要',
      icon: Zap,
      color: 'text-red-500',
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      filter: (t: any) => t.priority === 1 && isUrgent(t.deadline),
      actions: [
        { label: '予定へ', target: 'q2', icon: ArrowRight },
        { label: '委任へ', target: 'q3', icon: ArrowDown },
      ]
    },
    {
      id: 'q2',
      title: '計画',
      subtitle: '緊急ではない ＆ 重要',
      icon: Clock,
      color: 'text-accent',
      bg: 'bg-accent/5',
      border: 'border-accent/20',
      filter: (t: any) => t.priority === 1 && !isUrgent(t.deadline),
      actions: [
        { label: '即実行へ', target: 'q1', icon: ArrowLeft },
        { label: '削除へ', target: 'q4', icon: ArrowDown },
      ]
    },
    {
      id: 'q3',
      title: '委任',
      subtitle: '緊急 ＆ 重要ではない',
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      filter: (t: any) => t.priority !== 1 && isUrgent(t.deadline),
      actions: [
        { label: '即実行へ', target: 'q1', icon: ArrowUp },
        { label: '削除へ', target: 'q4', icon: ArrowRight },
      ]
    },
    {
      id: 'q4',
      title: '削除',
      subtitle: '緊急ではない ＆ 重要ではない',
      icon: BookOpen,
      color: 'text-zinc-500',
      bg: 'bg-zinc-500/5',
      border: 'border-zinc-500/20',
      filter: (t: any) => t.priority !== 1 && !isUrgent(t.deadline),
      actions: [
        { label: '計画へ', target: 'q2', icon: ArrowUp },
        { label: '委任へ', target: 'q3', icon: ArrowLeft },
      ]
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">マトリックス分析</h2>
        <p className="text-zinc-500 text-sm mt-1">優先度と期限に基づいたアイゼンハワー・マトリックス。移動して再優先順位付けが可能です。</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 md:aspect-square max-w-4xl mx-auto">
        {quadrants.map((q) => (
          <div 
            key={q.id}
            className={cn(
              "p-4 md:p-6 rounded-2xl md:rounded-3xl border flex flex-col transition-all hover:border-zinc-700 min-h-[200px] md:min-h-0",
              q.bg, q.border
            )}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className={cn("text-lg md:text-xl font-bold", q.color)}>{q.title}</h3>
                <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-zinc-500">{q.subtitle}</p>
              </div>
              <q.icon size={20} className={q.color} />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {tasks.filter(t => t.status !== 'done').filter(q.filter).map(task => (
                <div key={task.id} className="group relative bg-bg/50 border border-white/5 p-2 md:p-3 rounded-xl text-xs md:text-sm font-medium">
                  {task.title}
                  <div className="absolute inset-0 bg-zinc-900/95 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded-xl px-2">
                    {q.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => moveTask(task.id, action.target)}
                        className="flex flex-col items-center gap-1 p-1 hover:text-accent transition-colors"
                        title={action.label}
                      >
                        <action.icon size={14} />
                        <span className="text-[8px] font-bold">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status !== 'done').filter(q.filter).length === 0 && (
                <div className="h-full flex items-center justify-center opacity-10 grayscale py-8 md:py-0">
                  <q.icon size={48} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
