import { useState, useEffect } from 'react';
import { SharedNote, ChangeHistory } from '../types/Note';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export const useSharedNotes = () => {
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const { toast } = useToast();
  const { getUserName } = useAuth();

  useEffect(() => {
    // Carrega notas compartilhadas do localStorage
    const savedSharedNotes = localStorage.getItem('glassnotes_shared_notes');
    if (savedSharedNotes) {
      try {
        const parsedNotes = JSON.parse(savedSharedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          changeHistory: note.changeHistory.map((change: any) => ({
            ...change,
            timestamp: new Date(change.timestamp)
          }))
        }));
        setSharedNotes(parsedNotes);
      } catch (error) {
        console.error('Erro ao carregar notas compartilhadas:', error);
      }
    }
  }, []);

  const saveSharedNotes = (notesToSave: SharedNote[]) => {
    localStorage.setItem('glassnotes_shared_notes', JSON.stringify(notesToSave));
    setSharedNotes(notesToSave);
  };

  const createSharedNote = (noteData: Partial<SharedNote>) => {
    const currentUser = getUserName();
    if (!currentUser) return null;

    const newNote: SharedNote = {
      id: crypto.randomUUID(),
      title: noteData.title || 'Nova Nota Compartilhada',
      content: noteData.content || '',
      password: noteData.password || undefined,
      backgroundColor: noteData.backgroundColor || undefined,
      backgroundImage: noteData.backgroundImage || undefined,
      isLocked: !!noteData.password,
      isShared: true,
      owner: currentUser,
      sharedWith: [],
      changeHistory: [{
        id: crypto.randomUUID(),
        userId: currentUser,
        userName: currentUser,
        timestamp: new Date(),
        action: 'Criou a nota',
        details: `Nota "${noteData.title || 'Nova Nota Compartilhada'}" foi criada`
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedNotes = [newNote, ...sharedNotes];
    saveSharedNotes(updatedNotes);

    toast({
      title: "✅ Nota compartilhada criada",
      description: `"${newNote.title}" foi criada e está pronta para ser compartilhada`,
      duration: 3000,
    });

    return newNote;
  };

  const updateSharedNote = (id: string, noteData: Partial<SharedNote>, actionDescription?: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const noteToUpdate = sharedNotes.find(note => note.id === id);
    if (!noteToUpdate) return;

    // Verifica se o usuário tem permissão para editar
    if (noteToUpdate.owner !== currentUser && !noteToUpdate.sharedWith.includes(currentUser)) {
      toast({
        title: "❌ Sem permissão",
        description: "Você não tem permissão para editar esta nota",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Identifica quais campos foram alterados
    const changes: string[] = [];
    if (noteData.title && noteData.title !== noteToUpdate.title) {
      changes.push(`Alterou título para "${noteData.title}"`);
    }
    if (noteData.content !== undefined && noteData.content !== noteToUpdate.content) {
      changes.push(noteData.content ? 'Modificou conteúdo' : 'Removeu conteúdo');
    }
    if (noteData.backgroundColor !== noteToUpdate.backgroundColor) {
      changes.push('Mudou cor de fundo');
    }
    if (noteData.backgroundImage !== noteToUpdate.backgroundImage) {
      changes.push(noteData.backgroundImage ? 'Adicionou imagem de fundo' : 'Removeu imagem de fundo');
    }

    const changeDescription = actionDescription || (changes.length > 0 ? changes.join(', ') : 'Modificou a nota');

    // Cria novo registro no histórico
    const newHistoryEntry: ChangeHistory = {
      id: crypto.randomUUID(),
      userId: currentUser,
      userName: currentUser,
      timestamp: new Date(),
      action: changeDescription,
      details: changes.join('; ')
    };

    const updatedNotes = sharedNotes.map(note =>
      note.id === id
        ? {
            ...note,
            ...noteData,
            changeHistory: [newHistoryEntry, ...note.changeHistory],
            updatedAt: new Date()
          }
        : note
    );

    saveSharedNotes(updatedNotes);

    toast({
      title: "💾 Nota compartilhada salva",
      description: "Suas alterações foram sincronizadas com todos os colaboradores",
      duration: 2000,
    });
  };

  const shareNoteWithUser = (noteId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const noteToShare = sharedNotes.find(note => note.id === noteId);
    if (!noteToShare) return;

    if (noteToShare.owner !== currentUser) {
      toast({
        title: "❌ Sem permissão",
        description: "Apenas o proprietário pode compartilhar esta nota",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (noteToShare.sharedWith.includes(userName)) {
      toast({
        title: "⚠️ Já compartilhado",
        description: `Esta nota já foi compartilhada com ${userName}`,
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
      action: 'Compartilhou a nota',
      details: `Nota compartilhada com ${userName}`
    };

    const updatedNotes = sharedNotes.map(note =>
      note.id === noteId
        ? {
            ...note,
            sharedWith: [...note.sharedWith, userName],
            changeHistory: [shareHistoryEntry, ...note.changeHistory],
            updatedAt: new Date()
          }
        : note
    );

    saveSharedNotes(updatedNotes);

    toast({
      title: "✅ Nota compartilhada",
      description: `"${noteToShare.title}" foi compartilhada com ${userName}`,
      duration: 3000,
    });
  };

  const removeUserFromNote = (noteId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const noteToUpdate = sharedNotes.find(note => note.id === noteId);
    if (!noteToUpdate) return;

    if (noteToUpdate.owner !== currentUser) {
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
      details: `${userName} foi removido da nota`
    };

    const updatedNotes = sharedNotes.map(note =>
      note.id === noteId
        ? {
            ...note,
            sharedWith: note.sharedWith.filter(user => user !== userName),
            changeHistory: [removeHistoryEntry, ...note.changeHistory],
            updatedAt: new Date()
          }
        : note
    );

    saveSharedNotes(updatedNotes);

    toast({
      title: "✅ Colaborador removido",
      description: `${userName} foi removido de "${noteToUpdate.title}"`,
      duration: 3000,
    });
  };

  const deleteSharedNote = (id: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    const noteToDelete = sharedNotes.find(note => note.id === id);
    if (!noteToDelete) return;

    if (noteToDelete.owner !== currentUser) {
      toast({
        title: "❌ Sem permissão",
        description: "Apenas o proprietário pode excluir esta nota",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const updatedNotes = sharedNotes.filter(note => note.id !== id);
    saveSharedNotes(updatedNotes);

    toast({
      title: "🗑️ Nota compartilhada excluída",
      description: `"${noteToDelete.title}" foi removida permanentemente`,
      duration: 3000,
    });
  };

  // Obtém notas onde o usuário atual tem acesso (proprietário ou colaborador)
  const getAccessibleNotes = () => {
    const currentUser = getUserName();
    if (!currentUser) return [];

    return sharedNotes.filter(note => 
      note.owner === currentUser || note.sharedWith.includes(currentUser)
    );
  };

  // Simula sincronização em tempo real (para demonstração)
  const simulateRealTimeUpdate = (noteId: string, changes: Partial<SharedNote>) => {
    const randomUsers = ['Ana Silva', 'João Santos', 'Maria Costa', 'Pedro Lima'];
    const randomUser = randomUsers[Math.floor(Math.random() * randomUsers.length)];
    
    setTimeout(() => {
      updateSharedNote(noteId, changes, `Alteração remota por ${randomUser}`);
    }, Math.random() * 5000 + 2000); // Entre 2-7 segundos
  };

  return {
    sharedNotes: getAccessibleNotes(),
    createSharedNote,
    updateSharedNote,
    shareNoteWithUser,
    removeUserFromNote,
    deleteSharedNote,
    simulateRealTimeUpdate
  };
};
