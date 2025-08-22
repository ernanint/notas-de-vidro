import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from './use-toast';
import { useFirebaseAuth } from './useFirebaseAuth';

export interface FirebaseSharedTask {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
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

// Função utilitária para remover campos undefined e string vazias (Firestore não aceita)
const cleanFirestoreData = (obj: any) => {
  console.log('🧹 cleanFirestoreData TAREFAS - ENTRADA:', obj);
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    console.log(`🔍 cleanFirestoreData TAREFAS - ${key}:`, value, typeof value);
    // ESPECIAL para imagens: mantém mesmo se for string longa (base64)
    if (key === 'backgroundImage' && typeof value === 'string' && value.length > 0) {
      cleaned[key] = value;
      console.log(`✅ cleanFirestoreData TAREFAS - Mantendo backgroundImage (${value.length} chars)`);
    }
    // Mantém apenas valores que não são undefined e não são strings vazias
    else if (value !== undefined && value !== '') {
      cleaned[key] = value;
      console.log(`✅ cleanFirestoreData TAREFAS - Mantendo ${key}:`, value);
    } else {
      console.log(`❌ cleanFirestoreData TAREFAS - Removendo ${key} (undefined ou string vazia)`);
    }
  });
  console.log('🧹 cleanFirestoreData TAREFAS - SAÍDA:', cleaned);
  return cleaned;
};

export const useFirebaseSharedTasks = () => {
  const [sharedTasks, setSharedTasks] = useState<FirebaseSharedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getUserName } = useFirebaseAuth();

  useEffect(() => {
    const currentUser = getUserName();
    console.log('🔍 useFirebaseSharedTasks - useEffect executado');
    console.log('🔍 useFirebaseSharedTasks - currentUser:', currentUser);
    
    if (!currentUser) {
      console.log('❌ useFirebaseSharedTasks - Sem usuário, limpando tarefas');
      setSharedTasks([]);
      setLoading(false);
      return;
    }

    console.log('✅ useFirebaseSharedTasks - Usuário encontrado, criando queries...');

    // Query para tarefas onde o usuário é proprietário
    // REMOVENDO orderBy temporariamente para testar se é problema de índice
    const tasksQuery = query(
      collection(db, 'shared_tasks'),
      where('owner', '==', currentUser)
      // orderBy('updatedAt', 'desc') // COMENTADO PARA DEBUG
    );
    
    console.log('📋 useFirebaseSharedTasks - Query de tarefas próprias criada');

    // Query para tarefas compartilhadas com o usuário
    const tasksSharedWithQuery = query(
      collection(db, 'shared_tasks'),
      where('sharedWith', 'array-contains', currentUser)
    );
    
    console.log('📋 useFirebaseSharedTasks - Query de tarefas compartilhadas criada');

    // Listener para tarefas onde o usuário é proprietário
    console.log('🎧 useFirebaseSharedTasks - Iniciando listener de tarefas próprias...');
    const unsubscribeOwned = onSnapshot(tasksQuery, (snapshot) => {
      console.log('🔥 useFirebaseSharedTasks - Listener de tarefas próprias disparou!');
      console.log('🔥 useFirebaseSharedTasks - Documentos encontrados (próprias):', snapshot.docs.length);
      
      const ownedTasks = snapshot.docs.map(doc => {
        console.log('📄 useFirebaseSharedTasks - Processando tarefa própria:', doc.id, doc.data());
        return {
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate() || undefined,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          changeHistory: doc.data().changeHistory?.map((change: any) => ({
            ...change,
            timestamp: change.timestamp?.toDate() || new Date()
          })) || []
        };
      }) as FirebaseSharedTask[];

      console.log('📋 useFirebaseSharedTasks - Tarefas próprias processadas:', ownedTasks.length);

      // Listener para tarefas compartilhadas com o usuário
      console.log('🎧 useFirebaseSharedTasks - Iniciando listener de tarefas compartilhadas...');
      const unsubscribeShared = onSnapshot(tasksSharedWithQuery, (snapshot) => {
        console.log('🔥 useFirebaseSharedTasks - Listener de tarefas compartilhadas disparou!');
        console.log('🔥 useFirebaseSharedTasks - Documentos encontrados (compartilhadas):', snapshot.docs.length);
        
        const sharedWithTasks = snapshot.docs.map(doc => {
          console.log('📄 useFirebaseSharedTasks - Processando tarefa compartilhada:', doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate() || undefined,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            changeHistory: doc.data().changeHistory?.map((change: any) => ({
              ...change,
              timestamp: change.timestamp?.toDate() || new Date()
            })) || []
          };
        }) as FirebaseSharedTask[];

        console.log('📋 useFirebaseSharedTasks - Tarefas compartilhadas processadas:', sharedWithTasks.length);

        // Combina as duas listas sem duplicatas
        const allTasks = [...ownedTasks, ...sharedWithTasks];
        console.log('📋 useFirebaseSharedTasks - Total antes de filtrar duplicatas:', allTasks.length);
        
        const uniqueTasks = allTasks.filter((task, index, self) => 
          index === self.findIndex(t => t.id === task.id)
        );
        
        console.log('📋 useFirebaseSharedTasks - Total após filtrar duplicatas:', uniqueTasks.length);
        console.log('📋 useFirebaseSharedTasks - Tarefas finais:', uniqueTasks);

        setSharedTasks(uniqueTasks.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
        setLoading(false);
        
        console.log('✅ useFirebaseSharedTasks - Estado atualizado com sucesso!');
      }, (error) => {
        console.error('❌ useFirebaseSharedTasks - Erro no listener de compartilhadas:', error);
        setLoading(false);
      });

      return unsubscribeShared;
    }, (error) => {
      console.error('❌ useFirebaseSharedTasks - Erro no listener de próprias:', error);
      setLoading(false);
    });

    return unsubscribeOwned;
  }, [getUserName]);

  const createSharedTask = async (taskData: Partial<FirebaseSharedTask>) => {
    const currentUser = getUserName();
    console.log('🔥 useFirebaseSharedTasks - createSharedTask CHAMADO!');
    console.log('🔥 useFirebaseSharedTasks - currentUser:', currentUser);
    console.log('🔥 useFirebaseSharedTasks - taskData recebido:', taskData);
    
    if (!currentUser) {
      console.log('❌ useFirebaseSharedTasks - Usuário não autenticado');
      toast({
        title: "❌ Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    console.log('✅ useFirebaseSharedTasks - Usuário autenticado, continuando...');

    try {
      // Cria o objeto da tarefa (pode ter campos undefined)
      const taskToSave = {
        title: taskData.title || 'Nova Tarefa Compartilhada',
        description: taskData.description || '',
        completed: false,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : undefined,
        owner: currentUser,
        sharedWith: [],
        backgroundColor: taskData.backgroundColor,
        backgroundImage: taskData.backgroundImage,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        changeHistory: [{
          userId: currentUser,
          userName: currentUser,
          action: 'Criou a tarefa',
          timestamp: Timestamp.now()
        }]
      };

      // Remove campos undefined antes de enviar pro Firestore
      const cleanedTask = cleanFirestoreData(taskToSave);

      console.log('📋 Dados originais:', taskToSave);
      console.log('🧹 Dados limpos (sem undefined):', cleanedTask);
      console.log('📝 Salvando tarefa no Firestore...');
      const docRef = await addDoc(collection(db, 'shared_tasks'), cleanedTask);
      console.log('✅ Tarefa salva com sucesso! ID:', docRef.id);

      toast({
        title: "✅ Tarefa compartilhada criada",
        description: `Tarefa criada com sucesso! ID: ${docRef.id.substring(0, 8)}...`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('❌ Erro detalhado ao criar tarefa:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      
      let errorMessage = "Erro ao criar tarefa no Firebase";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Erro de permissão. Verifique as regras do Firestore para 'shared_tasks'.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase indisponível. Verifique sua conexão.";
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }

      toast({
        title: "❌ Erro ao criar tarefa",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const updateSharedTask = async (taskId: string, taskData: Partial<FirebaseSharedTask>) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const taskRef = doc(db, 'shared_tasks', taskId);
      
      // Cria o objeto de atualização
      const updateData = {
        ...taskData,
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : undefined,
        updatedAt: Timestamp.now(),
        changeHistory: arrayUnion({
          userId: currentUser,
          userName: currentUser,
          action: 'Modificou a tarefa',
          timestamp: Timestamp.now()
        })
      };

      // Remove campos undefined antes de enviar pro Firestore
      const cleanedData = cleanFirestoreData(updateData);
      
      await updateDoc(taskRef, cleanedData);

      toast({
        title: "💾 Tarefa salva",
        description: "Alterações sincronizadas com Firebase!",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const toggleSharedTask = async (taskId: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const task = sharedTasks.find(t => t.id === taskId);
      if (!task) return;

      const taskRef = doc(db, 'shared_tasks', taskId);
      
      await updateDoc(taskRef, {
        completed: !task.completed,
        updatedAt: Timestamp.now(),
        changeHistory: arrayUnion({
          userId: currentUser,
          userName: currentUser,
          action: !task.completed ? 'Marcou como concluída' : 'Desmarcou como concluída',
          timestamp: Timestamp.now()
        })
      });

      toast({
        title: !task.completed ? "✅ Tarefa concluída" : "🔄 Tarefa reaberta",
        description: !task.completed ? "Parabéns!" : "Tarefa marcada como pendente",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Erro ao alternar tarefa:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar status da tarefa",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const shareTaskWithUser = async (taskId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const taskRef = doc(db, 'shared_tasks', taskId);
      
      await updateDoc(taskRef, {
        sharedWith: arrayUnion(userName),
        updatedAt: Timestamp.now(),
        changeHistory: arrayUnion({
          userId: currentUser,
          userName: currentUser,
          action: `Compartilhou com ${userName}`,
          timestamp: Timestamp.now()
        })
      });

      toast({
        title: "✅ Tarefa compartilhada",
        description: `${userName} agora tem acesso à tarefa`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erro ao compartilhar tarefa:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao compartilhar tarefa",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const removeUserFromTask = async (taskId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const taskRef = doc(db, 'shared_tasks', taskId);
      
      await updateDoc(taskRef, {
        sharedWith: arrayRemove(userName),
        updatedAt: Timestamp.now(),
        changeHistory: arrayUnion({
          userId: currentUser,
          userName: currentUser,
          action: `Removeu ${userName}`,
          timestamp: Timestamp.now()
        })
      });

      toast({
        title: "✅ Usuario removido",
        description: `${userName} foi removido da tarefa`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao remover usuário",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const deleteSharedTask = async (taskId: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'shared_tasks', taskId));

      toast({
        title: "✅ Tarefa excluída",
        description: "Tarefa removida com sucesso",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erro ao excluir tarefa:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir tarefa",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return {
    sharedTasks,
    loading,
    createSharedTask,
    updateSharedTask,
    toggleSharedTask,
    shareTaskWithUser,
    removeUserFromTask,
    deleteSharedTask
  };
};
