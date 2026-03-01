import { create } from 'zustand';
import { db } from '../lib/db';
import { Task } from '../types/task';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  fetchTasks: async () => {
    set({ loading: true });
    const tasks = await db.tasks.toArray();
    set({ tasks, loading: false });
  },
  addTask: async (taskData) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await db.tasks.add(newTask);
    await get().fetchTasks();
  },
  updateTask: async (id, updates) => {
    const now = new Date().toISOString();
    await db.tasks.update(id, { ...updates, updatedAt: now });
    await get().fetchTasks();
  },
  deleteTask: async (id) => {
    await db.tasks.delete(id);
    await get().fetchTasks();
  },
}));
