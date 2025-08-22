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
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from './use-toast';
import { useFirebaseAuth } from './useFirebaseAuth';
import { ChecklistItem } from '../types/ChecklistItem';

export interface FirebaseChecklistItem {
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

// Função utilitária para remover campos undefined e string vazias (Firestore não aceita)
const cleanFirestoreData = (obj: any) => {
  console.log('🧹 cleanFirestoreData CHECKLIST - ENTRADA:', obj);
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    console.log(`🔍 cleanFirestoreData CHECKLIST - ${key}:`, value, typeof value);
    // ESPECIAL para imagens: mantém mesmo se for string longa (base64)
    if (key === 'backgroundImage' && typeof value === 'string' && value.length > 0) {
      cleaned[key] = value;
      console.log(`✅ cleanFirestoreData CHECKLIST - Mantendo backgroundImage (${value.length} chars)`);
    }
    // Mantém apenas valores que não são undefined e não são strings vazias
    else if (value !== undefined && value !== '') {
      cleaned[key] = value;
      console.log(`✅ cleanFirestoreData CHECKLIST - Mantendo ${key}:`, value);
    } else {
      console.log(`❌ cleanFirestoreData CHECKLIST - Removendo ${key} (undefined ou string vazia)`);
    }
  });
  console.log('🧹 cleanFirestoreData CHECKLIST - SAÍDA:', cleaned);
  return cleaned;
};

export const useFirebaseChecklist = () => {
  const [checklistItems, setChecklistItems] = useState<FirebaseChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getUserName } = useFirebaseAuth();

  useEffect(() => {
    const currentUser = getUserName();
    console.log('🔍 useFirebaseChecklist - useEffect executado');
    console.log('🔍 useFirebaseChecklist - currentUser:', currentUser);
    
    if (!currentUser) {
      console.log('❌ useFirebaseChecklist - Sem usuário, limpando itens');
      setChecklistItems([]);
      setLoading(false);
      return;
    }

    console.log('✅ useFirebaseChecklist - Usuário encontrado, criando queries...');

    // Query para itens onde o usuário é proprietário
    const itemsQuery = query(
      collection(db, 'checklist_items'),
      where('owner', '==', currentUser)
    );
    
    console.log('📋 useFirebaseChecklist - Query de itens próprios criada');

    // Query para itens compartilhados com o usuário
    const itemsSharedWithQuery = query(
      collection(db, 'checklist_items'),
      where('sharedWith', 'array-contains', currentUser)
    );
    
    console.log('📋 useFirebaseChecklist - Query de itens compartilhados criada');

    // Listener para itens onde o usuário é proprietário
    console.log('🎧 useFirebaseChecklist - Iniciando listener de itens próprios...');
    const unsubscribeOwned = onSnapshot(itemsQuery, (snapshot) => {
      console.log('🔥 useFirebaseChecklist - Listener de itens próprios disparou!');
      console.log('🔥 useFirebaseChecklist - Documentos encontrados (próprios):', snapshot.docs.length);
      
      const ownedItems = snapshot.docs.map(doc => {
        console.log('📄 useFirebaseChecklist - Processando item próprio:', doc.id, doc.data());
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          changeHistory: doc.data().changeHistory?.map((change: any) => ({
            ...change,
            timestamp: change.timestamp?.toDate() || new Date()
          })) || []
        };
      }) as FirebaseChecklistItem[];

      console.log('📋 useFirebaseChecklist - Itens próprios processados:', ownedItems.length);

      // Listener para itens compartilhados com o usuário
      console.log('🎧 useFirebaseChecklist - Iniciando listener de itens compartilhados...');
      const unsubscribeShared = onSnapshot(itemsSharedWithQuery, (snapshot) => {
        console.log('🔥 useFirebaseChecklist - Listener de itens compartilhados disparou!');
        console.log('🔥 useFirebaseChecklist - Documentos encontrados (compartilhados):', snapshot.docs.length);
        
        const sharedWithItems = snapshot.docs.map(doc => {
          console.log('📄 useFirebaseChecklist - Processando item compartilhado:', doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            changeHistory: doc.data().changeHistory?.map((change: any) => ({
              ...change,
              timestamp: change.timestamp?.toDate() || new Date()
            })) || []
          };
        }) as FirebaseChecklistItem[];

        console.log('📋 useFirebaseChecklist - Itens compartilhados processados:', sharedWithItems.length);

        // Combina as duas listas sem duplicatas
        const allItems = [...ownedItems, ...sharedWithItems];
        console.log('📋 useFirebaseChecklist - Total antes de filtrar duplicatas:', allItems.length);
        
        const uniqueItems = allItems.filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        );
        
        console.log('📋 useFirebaseChecklist - Total após filtrar duplicatas:', uniqueItems.length);
        console.log('📋 useFirebaseChecklist - Itens finais:', uniqueItems);

        setChecklistItems(uniqueItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
        setLoading(false);
        
        console.log('✅ useFirebaseChecklist - Estado atualizado com sucesso!');
      }, (error) => {
        console.error('❌ useFirebaseChecklist - Erro no listener de compartilhados:', error);
        setLoading(false);
      });

      return unsubscribeShared;
    }, (error) => {
      console.error('❌ useFirebaseChecklist - Erro no listener de próprios:', error);
      setLoading(false);
    });

    return unsubscribeOwned;
  }, [getUserName]);

  const createChecklistItem = async (itemData: Partial<FirebaseChecklistItem>) => {
    const currentUser = getUserName();
    console.log('🔥 useFirebaseChecklist - createChecklistItem CHAMADO!');
    console.log('🔥 useFirebaseChecklist - currentUser:', currentUser);
    console.log('🔥 useFirebaseChecklist - itemData recebido:', itemData);
    
    if (!currentUser) {
      console.log('❌ useFirebaseChecklist - Usuário não autenticado');
      toast({
        title: "❌ Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    console.log('✅ useFirebaseChecklist - Usuário autenticado, continuando...');

    try {
      // Cria o objeto do item (pode ter campos undefined)
      const itemToSave = {
        title: itemData.title || 'Novo Item',
        completed: false,
        owner: currentUser,
        sharedWith: [],
        backgroundColor: itemData.backgroundColor,
        backgroundImage: itemData.backgroundImage,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        changeHistory: [{
          userId: currentUser,
          userName: currentUser,
          action: 'Criou o item',
          timestamp: Timestamp.now()
        }]
      };

      // Remove campos undefined antes de enviar pro Firestore
      const cleanedItem = cleanFirestoreData(itemToSave);

      console.log('📋 useFirebaseChecklist - Dados originais:', itemToSave);
      console.log('🧹 useFirebaseChecklist - Dados limpos (sem undefined):', cleanedItem);
      console.log('📝 useFirebaseChecklist - Salvando item no Firestore...');
      const docRef = await addDoc(collection(db, 'checklist_items'), cleanedItem);
      console.log('✅ useFirebaseChecklist - Item salvo com sucesso! ID:', docRef.id);

      toast({
        title: "✅ Item adicionado",
        description: `Item criado com sucesso!`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('❌ useFirebaseChecklist - Erro detalhado ao criar item:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      
      let errorMessage = "Erro ao criar item no Firebase";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Erro de permissão. Verifique as regras do Firestore para 'checklist_items'.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase indisponível. Verifique sua conexão.";
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }

      toast({
        title: "❌ Erro ao criar item",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const updateChecklistItem = async (itemId: string, itemData: Partial<FirebaseChecklistItem>) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const itemRef = doc(db, 'checklist_items', itemId);
      
      // Cria o objeto de atualização
      const updateData = {
        ...itemData,
        updatedAt: Timestamp.now(),
        changeHistory: arrayUnion({
          userId: currentUser,
          userName: currentUser,
          action: 'Modificou o item',
          timestamp: Timestamp.now()
        })
      };

      // Remove campos undefined antes de enviar pro Firestore
      const cleanedData = cleanFirestoreData(updateData);
      
      await updateDoc(itemRef, cleanedData);

      toast({
        title: "💾 Item salvo",
        description: "Alterações sincronizadas com Firebase!",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar item",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const toggleChecklistItem = async (itemId: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const item = checklistItems.find(t => t.id === itemId);
      if (!item) return;

      const itemRef = doc(db, 'checklist_items', itemId);
      
      await updateDoc(itemRef, {
        completed: !item.completed,
        updatedAt: Timestamp.now(),
        changeHistory: arrayUnion({
          userId: currentUser,
          userName: currentUser,
          action: !item.completed ? 'Marcou como concluído' : 'Desmarcou como concluído',
          timestamp: Timestamp.now()
        })
      });

      toast({
        title: !item.completed ? "✅ Item concluído" : "🔄 Item reaberto",
        description: !item.completed ? "Parabéns!" : "Item marcado como pendente",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Erro ao alternar item:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar status do item",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const shareItemWithUser = async (itemId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const itemRef = doc(db, 'checklist_items', itemId);
      
      await updateDoc(itemRef, {
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
        title: "✅ Item compartilhado",
        description: `${userName} agora tem acesso ao item`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erro ao compartilhar item:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao compartilhar item",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const removeUserFromItem = async (itemId: string, userName: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      const itemRef = doc(db, 'checklist_items', itemId);
      
      await updateDoc(itemRef, {
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
        description: `${userName} foi removido do item`,
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

  const deleteChecklistItem = async (itemId: string) => {
    const currentUser = getUserName();
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'checklist_items', itemId));

      toast({
        title: "✅ Item excluído",
        description: "Item removido com sucesso",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir item",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return {
    checklistItems,
    loading,
    createChecklistItem,
    updateChecklistItem,
    toggleChecklistItem,
    shareItemWithUser,
    removeUserFromItem,
    deleteChecklistItem
  };
};
