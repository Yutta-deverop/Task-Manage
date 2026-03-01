import React, { useState, useEffect, useRef } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Play, Pause, RotateCcw, CheckCircle2, Timer as TimerIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function FocusTimer() {
  const { updateTask } = useTaskStore();
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        const newProgress = Math.min(task.progress + 10, 100);
        await updateTask(selectedTaskId, { 
          progress: newProgress,
          status: newProgress === 100 ? 'done' : 'in-progress'
        });
      }
    }
    // Notification
    if (Notification.permission === 'granted') {
      new Notification('集中セッション完了！', {
        body: '休憩の時間です。',
        icon: '/favicon.ico'
      });
    }
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 md:space-y-12 py-6 md:py-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4 md:space-y-6">
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-accent">ディープフォーカス・モード</h2>
        <div className="flex justify-center gap-2 mb-2 md:mb-4">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              disabled={isActive}
              onClick={() => setDuration(m)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                duration === m 
                  ? "bg-accent text-bg" 
                  : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-border"
              )}
            >
              {m}分
            </button>
          ))}
        </div>
        <div className="relative inline-block w-full">
          <div className="text-[6rem] sm:text-[8rem] md:text-[12rem] font-mono font-bold tracking-tighter leading-none text-white tabular-nums">
            {formatTime(timeLeft)}
          </div>
          <div className="absolute -bottom-4 left-0 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-1000 linear" 
              style={{ width: `${(timeLeft / (duration * 60)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 md:gap-6">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={cn(
            "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all active:scale-90",
            isActive ? "bg-zinc-800 text-white" : "bg-accent text-bg"
          )}
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button 
          onClick={() => { setIsActive(false); setTimeLeft(duration * 60); }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-900 border border-border text-zinc-400 flex items-center justify-center hover:text-white transition-all active:scale-90"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 space-y-4">
        <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <TimerIcon size={14} />
          タスクをバインド
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {tasks.filter(t => t.status !== 'done').map(task => (
            <button
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={cn(
                "flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all text-left",
                selectedTaskId === task.id 
                  ? "bg-accent/5 border-accent text-white" 
                  : "bg-zinc-900/50 border-border text-zinc-400 hover:border-zinc-700"
              )}
            >
              <span className="font-medium text-sm md:text-base">{task.title}</span>
              {selectedTaskId === task.id && <CheckCircle2 size={18} className="text-accent" />}
            </button>
          ))}
          {tasks.filter(t => t.status !== 'done').length === 0 && (
            <p className="text-center py-4 text-zinc-600 text-sm italic">バインド可能なタスクがありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
