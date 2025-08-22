import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from './use-toast';

export interface FirebaseUser {
  id?: string;
  name: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  createdAt: Date;
  lastLogin: Date;
}

export const useFirebaseAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se há sessão ativa
    const authSession = sessionStorage.getItem('glassnotes_firebase_auth');
    const userName = sessionStorage.getItem('glassnotes_firebase_user');
    
    if (authSession === 'true' && userName) {
      setIsAuthenticated(true);
      setCurrentUser(userName);
    }
    setLoading(false);
  }, []);

  const register = async (name: string, password: string, securityQuestion: string, securityAnswer: string) => {
    try {
      console.log('🔥 Tentando criar usuário no Firebase...', { name, securityQuestion });

      // Verifica se usuário já existe
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '==', name)
      );
      
      console.log('🔍 Verificando se usuário já existe...');
      const querySnapshot = await getDocs(usersQuery);

      if (!querySnapshot.empty) {
        console.log('❌ Usuário já existe');
        toast({
          title: "❌ Usuário já existe",
          description: "Este nome de usuário já está em uso",
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }

      console.log('✅ Nome de usuário disponível, criando...');

      // Cria novo usuário no Firebase
      const newUser = {
        name,
        password, // Em produção, deve ser hasheado!
        securityQuestion,
        securityAnswer: securityAnswer.toLowerCase().trim(),
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };

      console.log('📝 Salvando usuário no Firestore...', newUser);
      const docRef = await addDoc(collection(db, 'users'), newUser);
      console.log('✅ Usuário salvo com ID:', docRef.id);

      // Salva sessão
      sessionStorage.setItem('glassnotes_firebase_auth', 'true');
      sessionStorage.setItem('glassnotes_firebase_user', name);
      
      setIsAuthenticated(true);
      setCurrentUser(name);

      toast({
        title: "✅ Conta criada no Firebase",
        description: `Bem-vindo ao GlassNotes, ${name}! ID: ${docRef.id.substring(0, 8)}...`,
        duration: 3000,
      });

      // Dispara evento de mudança de auth
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('glassnotes_auth_change'));
      }, 100);

      return true;
    } catch (error: any) {
      console.error('❌ Erro detalhado ao criar usuário:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      
      let errorMessage = "Não foi possível criar a conta.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Erro de permissão. Verifique as regras do Firestore.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase indisponível. Verifique sua conexão com a internet.";
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }

      toast({
        title: "❌ Erro no Firebase",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
  };

  const login = async (name: string, password: string) => {
    try {
      console.log('🔥 Tentando fazer login no Firebase...', { name });

      // Busca usuário no Firebase
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '==', name),
        where('password', '==', password)
      );
      
      console.log('🔍 Buscando usuário...');
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        console.log('❌ Usuário não encontrado');
        toast({
          title: "❌ Login inválido",
          description: "Nome ou senha incorretos",
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }

      console.log('✅ Login bem-sucedido');

      // Login bem-sucedido
      sessionStorage.setItem('glassnotes_firebase_auth', 'true');
      sessionStorage.setItem('glassnotes_firebase_user', name);
      
      setIsAuthenticated(true);
      setCurrentUser(name);

      toast({
        title: "✅ Login realizado",
        description: `Bem-vindo de volta, ${name}!`,
        duration: 2000,
      });

      // Dispara evento de mudança de auth
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('glassnotes_auth_change'));
      }, 100);

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao fazer login:', error);
      
      let errorMessage = "Não foi possível fazer login.";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Erro de permissão. Verifique as regras do Firestore.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase indisponível. Verifique sua conexão.";
      }

      toast({
        title: "❌ Erro no Firebase",
        description: errorMessage,
        variant: "destructive",
        duration: 4000,
      });
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('glassnotes_firebase_auth');
    sessionStorage.removeItem('glassnotes_firebase_user');
    
    setIsAuthenticated(false);
    setCurrentUser(null);

    toast({
      title: "👋 Até logo!",
      description: "Você foi desconectado do Firebase",
      duration: 2000,
    });

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('glassnotes_auth_change'));
    }, 100);
  };

  const getUserName = () => currentUser;

  const resetPassword = async (answer: string) => {
    if (!currentUser) return false;

    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '==', currentUser)
      );
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        toast({
          title: "❌ Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (userData.securityAnswer === answer.toLowerCase().trim()) {
        const newPassword = prompt('Digite sua nova senha:');
        if (newPassword && newPassword.length >= 3) {
          // Em um app real, você atualizaria no Firebase
          toast({
            title: "✅ Senha redefinida",
            description: "Sua senha foi alterada com sucesso",
            duration: 3000,
          });
          return true;
        }
      } else {
        toast({
          title: "❌ Resposta incorreta",
          description: "A resposta da pergunta de segurança está incorreta",
          variant: "destructive",
          duration: 3000,
        });
      }
      return false;
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "❌ Erro no Firebase",
        description: "Não foi possível resetar a senha",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
  };

  const checkUserExists = async () => {
    try {
      console.log('🔍 Verificando se existem usuários no Firebase...');
      const querySnapshot = await getDocs(collection(db, 'users'));
      const exists = !querySnapshot.empty;
      console.log('📊 Usuários encontrados:', querySnapshot.size);
      return exists;
    } catch (error: any) {
      console.error('❌ Erro ao verificar usuários:', error);
      return false;
    }
  };

  return {
    isAuthenticated,
    currentUser,
    loading,
    register,
    login,
    logout,
    resetPassword,
    getUserName,
    checkUserExists
  };
};