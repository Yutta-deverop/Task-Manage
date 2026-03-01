import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar as CalendarIcon,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Task } from '../types/task';

export function TaskCore() {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);

  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const loading = tasks.length === 0 && !isAdding; // Simple loading check

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTask({
      title: newTitle,
      description: '',
      status: 'todo',
      priority: 2,
      deadline: new Date(newDeadline).toISOString(),
      progress: 0,
      parentId: null,
    });
    setNewTitle('');
    setNewDeadline(format(new Date(), 'yyyy-MM-dd'));
    setIsAdding(false);
  };

  const toggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { 
      status: nextStatus,
      progress: nextStatus === 'done' ? 100 : 0
    });
  };

  // Sort tasks: Priority (1 > 2 > 3), then Deadline (earlier first)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const activeTasks = sortedTasks.filter(t => t.status !== 'done');
  const completedTasks = sortedTasks.filter(t => t.status === 'done');

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">タスクコア</h2>
          <p className="text-zinc-500 text-sm mt-1">ワークフローとタスク階層を管理します。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-card border border-border rounded-lg p-1">
            <button 
              onClick={() => setView('list')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                view === 'list' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              リスト
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                view === 'kanban' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              カンバン
            </button>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-accent hover:bg-accent/90 text-bg px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">新規タスク</span>
            <span className="sm:hidden">追加</span>
          </button>
        </div>
      </header>

      {isAdding && (
        <form onSubmit={handleAddTask} className="bg-card border border-accent/30 p-4 rounded-xl shadow-2xl shadow-accent/5 animate-in slide-in-from-top-4 duration-300 space-y-4">
          <input
            autoFocus
            type="text"
            placeholder="何をしますか？"
            className="bg-transparent border-none text-lg md:text-xl font-medium w-full focus:ring-0 placeholder:text-zinc-700"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex items-center gap-4 px-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <CalendarIcon size={16} />
              <input 
                type="date" 
                className="bg-zinc-900 border border-border rounded px-2 py-1 text-xs text-zinc-300 focus:border-accent outline-none"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-500 hover:text-zinc-300 text-sm font-medium px-3 py-1"
            >
              キャンセル
            </button>
            <button 
              type="submit"
              className="bg-accent text-bg px-4 py-1.5 rounded-md text-sm font-bold"
            >
              タスク作成
            </button>
          </div>
        </form>
      )}

      {view === 'list' ? (
        <div className="space-y-4">
          <div className="space-y-3 md:space-y-4">
            {activeTasks.map((task) => (
              <div 
                key={task.id}
                className="group bg-card/40 hover:bg-card border border-border hover:border-zinc-700 p-3 md:p-4 rounded-xl flex items-center gap-3 md:gap-4 transition-all duration-200"
              >
                <button 
                  onClick={() => toggleStatus(task)}
                  className={cn(
                    "transition-colors duration-200 shrink-0",
                    task.status === 'done' ? "text-accent" : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {task.status === 'done' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium truncate text-sm md:text-base",
                    task.status === 'done' && "text-zinc-500 line-through"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className="relative">
                      {editingDeadlineId === task.id ? (
                        <input 
                          type="date"
                          autoFocus
                          className="bg-zinc-900 border border-accent rounded px-2 py-0.5 text-[10px] text-zinc-300 outline-none"
                          value={format(new Date(task.deadline), 'yyyy-MM-dd')}
                          onBlur={() => setEditingDeadlineId(null)}
                          onChange={async (e) => {
                            await updateTask(task.id, { deadline: new Date(e.target.value).toISOString() });
                            setEditingDeadlineId(null);
                          }}
                        />
                      ) : (
                        <button 
                          onClick={() => setEditingDeadlineId(task.id)}
                          className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-accent transition-colors"
                        >
                          <CalendarIcon size={12} />
                          {format(new Date(task.deadline), 'M月d日')}
                        </button>
                      )}
                    </div>
                    <span className={cn(
                      "flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold",
                      task.priority === 1 ? "text-red-500" : task.priority === 2 ? "text-amber-500" : "text-blue-500"
                    )}>
                      <Flag size={12} />
                      優先度{task.priority}
                    </span>
                    <div className="hidden sm:block flex-1 max-w-[100px] h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-500" 
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 md:gap-2 transition-opacity">
                  <button className="p-1.5 md:p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
                    <Clock size={18} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 md:p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-zinc-500 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {completedTasks.length > 0 && (
            <div className="mt-8 border-t border-border pt-4">
              <button 
                onClick={() => setIsCompletedOpen(!isCompletedOpen)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
              >
                {isCompletedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                完了済み ({completedTasks.length})
              </button>
              
              {isCompletedOpen && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  {completedTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="group bg-zinc-900/30 border border-border/50 p-3 rounded-xl flex items-center gap-4 transition-all duration-200"
                    >
                      <button 
                        onClick={() => toggleStatus(task)}
                        className="text-accent shrink-0"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate text-zinc-500 line-through">
                          {task.title}
                        </h3>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-zinc-600 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTasks.length === 0 && completedTasks.length === 0 && !loading && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
              <p className="text-zinc-500 font-mono text-sm">タスクが見つかりません</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['todo', 'in-progress', 'done'].map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'todo' ? "bg-zinc-500" : status === 'in-progress' ? "bg-accent" : "bg-blue-500"
                  )} />
                  {status === 'todo' ? '未着手' : status === 'in-progress' ? '進行中' : '完了'}
                </h3>
                <span className="text-[10px] font-mono text-zinc-600">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="space-y-3 min-h-[100px] md:min-h-[200px]">
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="bg-card border border-border p-4 rounded-xl shadow-sm hover:border-zinc-700 transition-colors cursor-grab active:cursor-grabbing">
                    <h4 className="text-sm font-medium mb-3">{task.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500">#{task.id.slice(0, 4)}</span>
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-bg flex items-center justify-center text-[8px]">AI</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
