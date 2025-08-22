import { useState, useEffect } from 'react';
import { Task } from '../types/Task';
import { useToast } from './use-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load tasks from localStorage on mount
    const savedTasks = localStorage.getItem('glassnotes_tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing tasks:', error);
      }
    }
  }, []);

  const saveTasks = (tasksToSave: Task[]) => {
    localStorage.setItem('glassnotes_tasks', JSON.stringify(tasksToSave));
    setTasks(tasksToSave);
  };

  const createTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title || 'Nova Tarefa',
      description: taskData.description || '',
      dueDate: taskData.dueDate || undefined,
      dueTime: taskData.dueTime || undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedTasks = [newTask, ...tasks];
    saveTasks(updatedTasks);

    // Schedule notification if date/time is set
    if (newTask.dueDate && newTask.dueTime) {
      scheduleNotification(newTask);
    }

    toast({
      title: "✅ Tarefa criada com sucesso",
      description: `"${newTask.title}" foi adicionada às suas tarefas`,
      duration: 3000,
    });

    return newTask;
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? {
            ...task,
            ...taskData,
            updatedAt: new Date()
          }
        : task
    );

    saveTasks(updatedTasks);

    toast({
      title: "💾 Tarefa atualizada",
      description: "Suas alterações foram salvas com sucesso",
      duration: 2000,
    });
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTasks = tasks.map(t =>
      t.id === id
        ? {
            ...t,
            completed: !t.completed,
            updatedAt: new Date()
          }
        : t
    );

    saveTasks(updatedTasks);

    toast({
      title: task.completed ? "⭕ Tarefa reaberta" : "✅ Tarefa concluída",
      description: `"${task.title}" foi ${task.completed ? 'reaberta' : 'marcada como concluída'}`,
      duration: 2000,
    });
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);

    toast({
      title: "🗑️ Tarefa excluída",
      description: `"${taskToDelete?.title}" foi removida permanentemente`,
      duration: 3000,
    });
  };

  const scheduleNotification = (task: Task) => {
    if (!task.dueDate || !task.dueTime || !('Notification' in window)) return;

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (Notification.permission !== 'granted') return;

    try {
      const [hours, minutes] = task.dueTime.split(':');
      const notificationDate = new Date(task.dueDate);
      notificationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const now = new Date();
      const timeUntilNotification = notificationDate.getTime() - now.getTime();

      if (timeUntilNotification > 0) {
        setTimeout(() => {
          new Notification('🔔 GlassNotes - Lembrete de Tarefa', {
            body: `É hora de: ${task.title}`,
            icon: '/favicon.ico',
            tag: task.id
          });
        }, timeUntilNotification);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  return {
    tasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask
  };
};