import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  BarChart3, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Award
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '../lib/utils';

export function LogArchiver() {
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];

  const completedTasks = tasks.filter(t => t.status === 'done');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Stats for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
  const dailyStats = last7Days.map(date => ({
    date,
    count: completedTasks.filter(t => isSameDay(new Date(t.updatedAt), date)).length
  }));

  const maxDaily = Math.max(...dailyStats.map(s => s.count), 1);

  const achievements = [
    { title: '早起き', desc: '午前9時までに5つのタスクを完了', icon: TrendingUp, unlocked: completedTasks.length >= 5 },
    { title: 'ディープダイバー', desc: '進捗100%でタスクを完了', icon: Award, unlocked: completedTasks.length >= 1 },
    { title: 'タスクマスター', desc: '合計50個のタスクを完了', icon: Trophy, unlocked: completedTasks.length >= 50 },
  ];

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">アーカイブ</h2>
        <p className="text-zinc-500 text-sm mt-1">パフォーマンス統計と実績のトラッキング。</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: '完了済み', value: completedTasks.length, icon: CheckCircle2, color: 'text-accent' },
          { label: '成功率', value: `${completionRate}%`, icon: BarChart3, color: 'text-blue-500' },
          { label: '全タスク', value: totalTasks, icon: Clock, color: 'text-zinc-400' },
          { label: '実績', value: achievements.filter(a => a.unlocked).length, icon: Trophy, color: 'text-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-4 md:p-6 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="text-2xl md:text-3xl font-mono font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp size={20} className="text-accent" />
            アクティビティ履歴
          </h3>
          <div className="flex items-end justify-between h-40 md:h-48 gap-1 md:gap-2">
            {dailyStats.map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-3 group">
                <div className="w-full relative flex flex-col justify-end h-full">
                  <div 
                    className="w-full bg-accent/20 group-hover:bg-accent/40 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(stat.count / maxDaily) * 100}%` }}
                  >
                    {stat.count > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-accent">
                        {stat.count}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[8px] md:text-[10px] font-mono text-zinc-600 uppercase">
                  {format(stat.date, 'eee', { locale: ja })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Award size={20} className="text-amber-500" />
            実績
          </h3>
          <div className="space-y-3 md:space-y-4">
            {achievements.map((achievement, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border transition-all",
                  achievement.unlocked ? "bg-amber-500/5 border-amber-500/20" : "bg-zinc-900/50 border-border opacity-40 grayscale"
                )}
              >
                <div className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0",
                  achievement.unlocked ? "bg-amber-500 text-bg" : "bg-zinc-800 text-zinc-500"
                )}>
                  <achievement.icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold">{achievement.title}</h4>
                  <p className="text-[8px] md:text-[10px] text-zinc-500">{achievement.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
