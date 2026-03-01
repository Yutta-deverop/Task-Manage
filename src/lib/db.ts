import Dexie, { type Table } from 'dexie';
import { Task, PomodoroSession } from '../types/task';

export class NexusDB extends Dexie {
  tasks!: Table<Task>;
  sessions!: Table<PomodoroSession>;

  constructor() {
    super('NexusDB');
    this.version(1).stores({
      tasks: 'id, status, priority, deadline, parentId, createdAt',
      sessions: 'id, taskId, completedAt'
    });
  }
}

export const db = new NexusDB();
