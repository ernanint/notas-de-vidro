import { useState, useEffect } from 'react';
import { SharedTask, ChangeHistory } from '../types/Task';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export const useSharedTasks = () => {
  const [sharedTasks, setSharedTasks] = useState<SharedTask[]>([]);
  const { toast } = useToast();
  const { getUserName } = useAuth();

  useEffect(() => {
    // Função para carregar tarefas compartilhadas
    const loadSharedTasks = () => {
      const savedSharedTasks = localStorage.getItem('glassnotes_shared_tasks');
      if (savedSharedTasks) {
        try {
          const parsedTasks = JSON.parse(savedSharedTasks).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            changeHistory: task.changeHistory.map((change: any) => ({
              ...change,
              timestamp: new Date(change.timestamp)
            }))
          }));
          setSharedTasks(parsedTasks);
        } catch (error) {
          console.error('Erro ao carregar tarefas compartilhadas:', error);
        }
      }
    };

    // Carrega inicialmente
    loadSharedTasks();

    // Listener para mudanças no localStorage (sincronização em tempo real)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'glassnotes_shared_tasks') {
        loadSharedTasks();
      }
    };

    // Listener para mudanças na mesma aba
    const handleAuthChange = () => {
      loadSharedTasks();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('glassnotes_auth_change', handleAuthChange);

    // Atualiza a cada 5 segundos para garantir sincronização
    const interval = setInterval(loadSharedTasks, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('glassnotes_auth_change', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const saveSharedTasks = (tasksToSave: SharedTask[]) => {
    localStorage.setItem('glassnotes_shared_tasks', JSON.stringify(tasksToSave));
    setSharedTasks(tasksToSave);
  };

  const createSharedTask = (taskData: Partial<SharedTask>) => {
    const currentUser = getUserName();
    if (!currentUser) return null;

    const newTask: SharedTask = {
      id: crypto.randomUUID(),
      title: taskData.title || 'Nova Tarefa Compartilhada',
      description: taskData.description || '',
      dueDate: taskData.dueDate || undefined,
      dueTime: taskData.dueTime || undefined,
      completed: false,
      isShared: true,
      owner: currentUser,
      sharedWith: [],
      changeHistory: [{
        id: crypto.randomUUID(),
        userId: currentUser,
        userName: currentUser,
        timestamp: new Date(),
        action: 'Criou a tarefa',
        details: `Tarefa "${taskData.title || 'Nova Tarefa Compartilhada'}" foi criada`
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedTasks = [newTask, ...sharedTasks];
    saveSharedTasks(updatedTasks);

    // Agenda notificação se data/hora foi definida
    if (newTask.dueDate && newTask.dueTime) {
      scheduleSharedTaskNotification(newTask);
    }

    toast({
      title: "✅ Tarefa compartilhada criada",
      description: `"${newTask.title}" foi criada e está pronta para ser compartilhada`,
      duration: 3000,
    });

    return newTask;
  };

  const updateSharedTask = (id: string, taskData: Partial<SharedTask>, actionDescription?: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const taskToUpdate = sharedTasks.find(task => task.id === id);
    if (!taskToUpdate) return;

    // Verifica se o usuário tem permissão para editar
    if (taskToUpdate.owner !== currentUser && !taskToUpdate.sharedWith.includes(currentUser)) {
      toast({
        title: "❌ Sem permissão",
        description: "Você não tem permissão para editar esta tarefa",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Identifica quais campos foram alterados
    const changes: string[] = [];
    if (taskData.title && taskData.title !== taskToUpdate.title) {
      changes.push(`Alterou título para "${taskData.title}"`);
    }
    if (taskData.description !== undefined && taskData.description !== taskToUpdate.description) {
      changes.push(taskData.description ? 'Modificou descrição' : 'Removeu descrição');
    }
    if (taskData.completed !== undefined && taskData.completed !== taskToUpdate.completed) {
      changes.push(taskData.completed ? 'Marcou como concluída' : 'Reabriu tarefa');
    }
    if (taskData.dueDate !== taskToUpdate.dueDate) {
      changes.push('Alterou data de vencimento');
    }
    if (taskData.dueTime !== taskToUpdate.dueTime) {
      changes.push('Alterou horário');
    }

    const changeDescription = actionDescription || (changes.length > 0 ? changes.join(', ') : 'Modificou a tarefa');

    // Cria novo registro no histórico
    const newHistoryEntry: ChangeHistory = {
      id: crypto.randomUUID(),
      userId: currentUser,
      userName: currentUser,
      timestamp: new Date(),
      action: changeDescription,
      details: changes.join('; ')
    };

    const updatedTasks = sharedTasks.map(task =>
      task.id === id
        ? {
            ...task,
            ...taskData,
            changeHistory: [newHistoryEntry, ...task.changeHistory],
            updatedAt: new Date()
          }
        : task
    );

    saveSharedTasks(updatedTasks);

    // Re-agenda notificação se data/hora foram alteradas
    const updatedTask = updatedTasks.find(task => task.id === id);
    if (updatedTask && updatedTask.dueDate && updatedTask.dueTime && !updatedTask.completed) {
      scheduleSharedTaskNotification(updatedTask);
    }

    toast({
      title: "💾 Tarefa compartilhada salva",
      description: "Suas alterações foram sincronizadas com todos os colaboradores",
      duration: 2000,
    });
  };

  const toggleSharedTask = (id: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const task = sharedTasks.find(t => t.id === id);
    if (!task) return;

    // Verifica permissão
    if (task.owner !== currentUser && !task.sharedWith.includes(currentUser)) {
      toast({
        title: "❌ Sem permissão",
        description: "Você não tem permissão para alterar esta tarefa",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    updateSharedTask(id, { completed: !task.completed }, 
      task.completed ? 'Reabriu a tarefa' : 'Marcou como concluída');
  };

  const shareTaskWithUser = (taskId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const taskToShare = sharedTasks.find(task => task.id === taskId);
    if (!taskToShare) return;

    if (taskToShare.owner !== currentUser) {
      toast({
        title: "❌ Sem permissão",
        description: "Apenas o proprietário pode compartilhar esta tarefa",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (taskToShare.sharedWith.includes(userName)) {
      toast({
        title: "⚠️ Já compartilhado",
        description: `Esta tarefa já foi compartilhada com ${userName}`,
        duration: 3000,
      });
      return;
    }

    if (userName === currentUser) {
      toast({
        title: "⚠️ Usuário inválido",
        description: "Você não pode compartilhar com você mesmo",
        duration: 3000,
      });
      return;
    }

    // Adiciona histórico de compartilhamento
    const shareHistoryEntry: ChangeHistory = {
      id: crypto.randomUUID(),
      userId: currentUser,
      userName: currentUser,
      timestamp: new Date(),
      action: 'Compartilhou a tarefa',
      details: `Tarefa compartilhada com ${userName}`
    };

    const updatedTasks = sharedTasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            sharedWith: [...task.sharedWith, userName],
            changeHistory: [shareHistoryEntry, ...task.changeHistory],
            updatedAt: new Date()
          }
        : task
    );

    saveSharedTasks(updatedTasks);

    toast({
      title: "✅ Tarefa compartilhada",
      description: `"${taskToShare.title}" foi compartilhada com ${userName}`,
      duration: 3000,
    });
  };

  const removeUserFromTask = (taskId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const taskToUpdate = sharedTasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    if (taskToUpdate.owner !== currentUser) {
      toast({
        title: "❌ Sem permissão",
        description: "Apenas o proprietário pode remover colaboradores",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Adiciona histórico de remoção
    const removeHistoryEntry: ChangeHistory = {
      id: crypto.randomUUID(),
      userId: currentUser,
      userName: currentUser,
      timestamp: new Date(),
      action: 'Removeu colaborador',
      details: `${userName} foi removido da tarefa`
    };

    const updatedTasks = sharedTasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            sharedWith: task.sharedWith.filter(user => user !== userName),
            changeHistory: [removeHistoryEntry, ...task.changeHistory],
            updatedAt: new Date()
          }
        : task
    );

    saveSharedTasks(updatedTasks);

    toast({
      title: "✅ Colaborador removido",
      description: `${userName} foi removido de "${taskToUpdate.title}"`,
      duration: 3000,
    });
  };

  const deleteSharedTask = (id: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const taskToDelete = sharedTasks.find(task => task.id === id);
    if (!taskToDelete) return;

    if (taskToDelete.owner !== currentUser) {
      toast({
        title: "❌ Sem permissão",
        description: "Apenas o proprietário pode excluir esta tarefa",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const updatedTasks = sharedTasks.filter(task => task.id !== id);
    saveSharedTasks(updatedTasks);

    toast({
      title: "🗑️ Tarefa compartilhada excluída",
      description: `"${taskToDelete.title}" foi removida permanentemente`,
      duration: 3000,
    });
  };

  // Obtém tarefas onde o usuário atual tem acesso
  const getAccessibleTasks = () => {
    const currentUser = getUserName();
    if (!currentUser) return [];

    return sharedTasks.filter(task => 
      task.owner === currentUser || task.sharedWith.includes(currentUser)
    );
  };

  const scheduleSharedTaskNotification = (task: SharedTask) => {
    if (!task.dueDate || !task.dueTime || !('Notification' in window)) return;

    // Solicita permissão para notificações
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
          new Notification('🔔 GlassNotes - Tarefa Compartilhada', {
            body: `É hora de: ${task.title} (Compartilhada por ${task.owner})`,
            icon: '/favicon.ico',
            tag: task.id
          });
        }, timeUntilNotification);
      }
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  };

  return {
    sharedTasks: getAccessibleTasks(),
    createSharedTask,
    updateSharedTask,
    toggleSharedTask,
    shareTaskWithUser,
    removeUserFromTask,
    deleteSharedTask
  };
};
