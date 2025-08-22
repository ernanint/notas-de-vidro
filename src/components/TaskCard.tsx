import { Calendar, Clock, Edit, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "./ui/button";
import { Task } from "../types/Task";
import { cn } from "../lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onToggle }: TaskCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds if present
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    
    const now = new Date();
    const dueDateTime = new Date(task.dueDate);
    
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':');
      dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      dueDateTime.setHours(23, 59, 59, 999); // End of day if no time specified
    }
    
    return now > dueDateTime;
  };

  const isToday = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    
    return today.getDate() === dueDate.getDate() &&
           today.getMonth() === dueDate.getMonth() &&
           today.getFullYear() === dueDate.getFullYear();
  };

  const overdue = isOverdue();
  const today = isToday();

  return (
    <div 
      className={cn(
        "glass-card p-4 group animate-glass-slide-up transition-all duration-300",
        task.completed && "opacity-60",
        overdue && !task.completed && "border-red-500/50 bg-red-500/5",
        today && !task.completed && "border-blue-500/50 bg-blue-500/5"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "mt-1 transition-colors duration-200",
            task.completed ? "text-green-400" : "text-muted-foreground hover:text-primary"
          )}
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 
                className={cn(
                  "font-semibold text-base leading-tight",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p 
                  className={cn(
                    "text-sm mt-1 line-clamp-2",
                    task.completed ? "text-muted-foreground" : "text-foreground/80"
                  )}
                >
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(task)}
                className="w-8 h-8 p-0 hover:bg-primary/20"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
                    onDelete(task.id);
                  }
                }}
                className="w-8 h-8 p-0 hover:bg-destructive/20 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Date and Time */}
          {(task.dueDate || task.dueTime) && (
            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/10">
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  overdue && !task.completed ? "text-red-400" : 
                  today && !task.completed ? "text-blue-400" : 
                  "text-muted-foreground"
                )}>
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
              
              {task.dueTime && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  overdue && !task.completed ? "text-red-400" : 
                  today && !task.completed ? "text-blue-400" : 
                  "text-muted-foreground"
                )}>
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(task.dueTime)}</span>
                </div>
              )}
              
              {overdue && !task.completed && (
                <span className="text-xs text-red-400 font-medium">Atrasada</span>
              )}
              
              {today && !task.completed && (
                <span className="text-xs text-blue-400 font-medium">Hoje</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};