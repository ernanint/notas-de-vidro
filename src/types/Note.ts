export interface Note {
  id: string;
  title: string;
  content: string;
  password?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  createdAt: Date;
  updatedAt: Date;
  isLocked: boolean;
}

export interface SharedNote extends Note {
  isShared: true;
  owner: string;
  sharedWith: string[];
  changeHistory: ChangeHistory[];
}

export interface ChangeHistory {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  action: string;
  details: string;
}