export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 1 | 2 | 3; // 1: High, 2: Medium, 3: Low
  deadline: string; // ISO format
  progress: number; // 0-100
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  duration: number; // minutes
  completedAt: string;
}
