import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface AuthData {
  name: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const authSession = sessionStorage.getItem('glassnotes_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const isRegistered = () => {
    return localStorage.getItem('glassnotes_user') !== null;
  };

  const register = (name: string, password: string, securityQuestion: string, securityAnswer: string) => {
    const userData: AuthData = {
      name,
      password,
      securityQuestion,
      securityAnswer: securityAnswer.toLowerCase().trim()
    };

    localStorage.setItem('glassnotes_user', JSON.stringify(userData));
    localStorage.setItem('glassnotes_security_question', securityQuestion);
    sessionStorage.setItem('glassnotes_auth', 'true');
    
    setIsAuthenticated(true);
    
    toast({
      title: "✅ Conta criada com sucesso",
      description: "Bem-vindo ao GlassNotes!",
      duration: 3000,
    });
  };

  const login = (name: string, password: string) => {
    const userData = localStorage.getItem('glassnotes_user');
    
    if (!userData) {
      toast({
        title: "❌ Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    const user: AuthData = JSON.parse(userData);
    
    if (user.name === name && user.password === password) {
      sessionStorage.setItem('glassnotes_auth', 'true');
      setIsAuthenticated(true);
      
      toast({
        title: "✅ Login realizado",
        description: `Bem-vindo de volta, ${user.name}!`,
        duration: 3000,
      });
      return true;
    } else {
      toast({
        title: "❌ Dados incorretos",
        description: "Nome de usuário ou senha incorretos",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('glassnotes_auth');
    setIsAuthenticated(false);
    
    toast({
      title: "👋 Até logo!",
      description: "Você foi desconectado com sucesso",
      duration: 3000,
    });
  };

  const resetPassword = (answer: string) => {
    const userData = localStorage.getItem('glassnotes_user');
    
    if (!userData) {
      toast({
        title: "❌ Erro",
        description: "Usuário não encontrado",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    const user: AuthData = JSON.parse(userData);
    
    if (user.securityAnswer === answer.toLowerCase().trim()) {
      // Allow user to set new password
      const newPassword = prompt('Digite sua nova senha:');
      if (newPassword && newPassword.length >= 3) {
        user.password = newPassword;
        localStorage.setItem('glassnotes_user', JSON.stringify(user));
        
        toast({
          title: "✅ Senha redefinida",
          description: "Sua senha foi alterada com sucesso",
          duration: 3000,
        });
        return true;
      } else {
        toast({
          title: "❌ Senha inválida",
          description: "A senha deve ter pelo menos 3 caracteres",
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
    } else {
      toast({
        title: "❌ Resposta incorreta",
        description: "A resposta da pergunta de segurança está incorreta",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
  };

  const getUserName = () => {
    const userData = localStorage.getItem('glassnotes_user');
    if (userData) {
      const user: AuthData = JSON.parse(userData);
      return user.name;
    }
    return null;
  };

  return {
    isAuthenticated,
    isRegistered: isRegistered(),
    register,
    login,
    logout,
    resetPassword,
    getUserName
  };
};