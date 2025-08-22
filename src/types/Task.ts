import { ChangeHistory } from './Note';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  dueTime?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedTask extends Task {
  isShared: true;
  owner: string;
  sharedWith: string[];
  changeHistory: ChangeHistory[];
}