export interface ChecklistItem {
  id?: string;
  title: string;
  completed: boolean;
  owner: string;
  sharedWith: string[];
  backgroundColor?: string;
  backgroundImage?: string;
  createdAt: Date;
  updatedAt: Date;
  changeHistory: {
    userId: string;
    userName: string;
    action: string;
    timestamp: Date;
  }[];
}
