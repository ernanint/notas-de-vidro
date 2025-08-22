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

export interface FirebaseSharedNote {
  id?: string;
  title: string;
  content: string;
  owner: string;
  sharedWith: string[];
  backgroundColor?: string;
  backgroundImage?: string;
  password?: string;
  isLocked: boolean;
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
  console.log('🧹 cleanFirestoreData NOTAS - ENTRADA:', obj);
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    console.log(`🔍 cleanFirestoreData NOTAS - ${key}:`, value, typeof value);
    // ESPECIAL para imagens: mantém mesmo se for string longa (base64)
    if (key === 'backgroundImage' && typeof value === 'string' && value.length > 0) {
      cleaned[key] = value;
      console.log(`✅ cleanFirestoreData NOTAS - Mantendo backgroundImage (${value.length} chars)`);
    }
    // Mantém apenas valores que não são undefined e não são strings vazias
    else if (value !== undefined && value !== '') {
      cleaned[key] = value;
      console.log(`✅ cleanFirestoreData NOTAS - Mantendo ${key}:`, value);
    } else {
      console.log(`❌ cleanFirestoreData NOTAS - Removendo ${key} (undefined ou string vazia)`);
    }
  });
  console.log('🧹 cleanFirestoreData NOTAS - SAÍDA:', cleaned);
  return cleaned;
};

export const useFirebaseSharedNotes = () => {
  const [sharedNotes, setSharedNotes] = useState<FirebaseSharedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getUserName } = useFirebaseAuth();

  useEffect(() => {
    const currentUser = getUserName();
    if (!currentUser) {
      setSharedNotes([]);
      setLoading(false);
      return;
    }

    // Query para buscar notas onde o usuário é owner ou está na lista sharedWith
    const notesQuery = query(
      collection(db, 'shared_notes'),
      where('owner', '==', currentUser)
    );

    const notesSharedWithQuery = query(
      collection(db, 'shared_notes'),
      where('sharedWith', 'array-contains', currentUser)
    );

    // Listener para notas onde o usuário é proprietário
    const unsubscribeOwned = onSnapshot(notesQuery, (snapshot) => {
      const ownedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        changeHistory: doc.data().changeHistory?.map((change: any) => ({
          ...change,
          timestamp: change.timestamp?.toDate() || new Date()
        })) || []
      })) as FirebaseSharedNote[];

      // Listener para notas compartilhadas com o usuário
      const unsubscribeShared = onSnapshot(notesSharedWithQuery, (snapshot) => {
        const sharedWithNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          changeHistory: doc.data().changeHistory?.map((change: any) => ({
            ...change,
            timestamp: change.timestamp?.toDate() || new Date()
          })) || []
        })) as FirebaseSharedNote[];

        // Combina as duas listas sem duplicatas
        const allNotes = [...ownedNotes, ...sharedWithNotes];
        const uniqueNotes = allNotes.filter((note, index, self) => 
          index === self.findIndex(n => n.id === note.id)
        );

        setSharedNotes(uniqueNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
        setLoading(false);
      });

      return unsubscribeShared;
    });

    return unsubscribeOwned;
  }, [getUserName]);

  const createSharedNote = async (noteData: Partial<FirebaseSharedNote>) => {
    const currentUser = getUserName();
    console.log('🔥 Tentando criar nota no Firebase...', { 
      currentUser, 
      noteData,
      hasBackgroundColor: !!noteData.backgroundColor,
      hasBackgroundImage: !!noteData.backgroundImage,
      hasPassword: !!noteData.password
    });
    
    if (!currentUser) {
      console.log('❌ Usuário não autenticado');
      toast({
        title: "❌ Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      // Cria o objeto da nota (pode ter campos undefined)
      const noteToSave = {
        title: noteData.title || 'Nova Nota Compartilhada',
        content: noteData.content || '',
        owner: currentUser,
        sharedWith: [],
        backgroundColor: noteData.backgroundColor,
        backgroundImage: noteData.backgroundImage,
        password: noteData.password,
        isLocked: !!noteData.password,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        changeHistory: [{
          userId: currentUser,
          userName: currentUser,
          action: 'Criou a nota',
          timestamp: Timestamp.now()
        }]
      };

      // Remove campos undefined antes de enviar pro Firestore
      const cleanedNote = cleanFirestoreData(noteToSave);

      console.log('📋 Dados originais:', noteToSave);
      console.log('🧹 Dados limpos (sem undefined):', cleanedNote);
      console.log('📝 Salvando nota no Firestore...');
      const docRef = await addDoc(collection(db, 'shared_notes'), cleanedNote);
      console.log('✅ Nota salva com sucesso! ID:', docRef.id);

      toast({
        title: "✅ Nota compartilhada criada",
        description: `Nota criada com sucesso! ID: ${docRef.id.substring(0, 8)}...`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('❌ Erro detalhado ao criar nota:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      
      let errorMessage = "Erro ao criar nota no Firebase";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Erro de permissão. Verifique as regras do Firestore para 'shared_notes'.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase indisponível. Verifique sua conexão.";
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }

      toast({
        title: "❌ Erro ao criar nota",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const updateSharedNote = async (noteId: string, noteData: Partial<FirebaseSharedNote>) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const noteRef = doc(db, 'shared_notes', noteId);
      
      // Cria o objeto de atualização
      const updateData = {
        ...noteData,
        updatedAt: Timestamp.now(),
        changeHistory: arrayUnion({
          userId: currentUser,
          userName: currentUser,
          action: 'Modificou a nota',
          timestamp: Timestamp.now()
        })
      };

      // Remove campos undefined antes de enviar pro Firestore
      const cleanedData = cleanFirestoreData(updateData);
      
      await updateDoc(noteRef, cleanedData);

      toast({
        title: "💾 Nota salva",
        description: "Alterações sincronizadas com Firebase!",
        duration: 2000,
      });
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar nota",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const shareNoteWithUser = async (noteId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const noteRef = doc(db, 'shared_notes', noteId);
      
      await updateDoc(noteRef, {
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
        title: "✅ Nota compartilhada",
        description: `Nota compartilhada com ${userName} via Firebase!`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao compartilhar nota:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao compartilhar nota",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const removeUserFromNote = async (noteId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const noteRef = doc(db, 'shared_notes', noteId);
      
      await updateDoc(noteRef, {
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
        description: `${userName} foi removido da nota`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao remover usuário",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const deleteSharedNote = async (noteId: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'shared_notes', noteId));

      toast({
        title: "🗑️ Nota excluída",
        description: "Nota removida do Firebase com sucesso",
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir nota",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return {
    sharedNotes,
    loading,
    createSharedNote,
    updateSharedNote,
    shareNoteWithUser,
    removeUserFromNote,
    deleteSharedNote
  };
};
