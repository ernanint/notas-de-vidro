import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { Eye, EyeOff, Lock, User, HelpCircle, Database, Loader2 } from "lucide-react";

export const AuthScreenFirebase = () => {
  const { register, login, resetPassword, checkUserExists, loading } = useFirebaseAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hasUsers, setHasUsers] = useState(false);
  const [checkingUsers, setCheckingUsers] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
    resetAnswer: ""
  });

  useEffect(() => {
    const checkFirebaseUsers = async () => {
      try {
        const exists = await checkUserExists();
        setHasUsers(exists);
        
        // Só define o modo inicial uma vez, não interfere depois
        if (!initialCheckDone) {
          setIsLogin(exists); // Se não há usuários, mostra tela de registro
          setInitialCheckDone(true);
        }
      } catch (error) {
        console.error('Erro ao verificar usuários:', error);
        setHasUsers(false);
        if (!initialCheckDone) {
          setIsLogin(false); // Em caso de erro, permite criar conta
          setInitialCheckDone(true);
        }
      } finally {
        setCheckingUsers(false);
      }
    };

    if (!loading && !initialCheckDone) {
      checkFirebaseUsers();
    }
  }, [loading, checkUserExists, initialCheckDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResetting) {
      const success = await resetPassword(formData.resetAnswer);
      if (success) {
        setIsResetting(false);
        setFormData({ ...formData, password: "", resetAnswer: "" });
      }
      return;
    }

    if (isLogin) {
      await login(formData.name, formData.password);
    } else {
      console.log('🔥 Tentando criar conta no Firebase...');
      const success = await register(formData.name, formData.password, formData.securityQuestion, formData.securityAnswer);
      if (success) {
        console.log('✅ Conta criada com sucesso!');
        setHasUsers(true); // Agora há usuários no Firebase
        // Login é automático após o registro, não precisa trocar modo
      } else {
        console.log('❌ Falha ao criar conta');
      }
    }
  };

  const switchMode = () => {
    console.log(`🔄 Trocando modo: ${isLogin ? 'Login' : 'Register'} → ${!isLogin ? 'Login' : 'Register'}`);
    setIsLogin(!isLogin);
    setIsResetting(false);
    setFormData({
      name: "",
      password: "",
      securityQuestion: "",
      securityAnswer: "",
      resetAnswer: ""
    });
  };

  if (loading || checkingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="glass-card w-full max-w-md animate-glass-fade">
          <CardContent className="pt-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Conectando ao Firebase</h3>
            <p className="text-sm text-muted-foreground">
              Verificando usuários na nuvem...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isResetting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="glass-card w-full max-w-md animate-glass-fade">
          <CardHeader className="text-center">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
            <CardDescription>
              Responda à pergunta de segurança para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="resetAnswer">Resposta da Pergunta de Segurança</Label>
                <Input
                  id="resetAnswer"
                  type="text"
                  value={formData.resetAnswer}
                  onChange={(e) => setFormData({ ...formData, resetAnswer: e.target.value })}
                  className="glass-input"
                  placeholder="Digite sua resposta"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="glass-button flex-1">
                  Confirmar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsResetting(false)}
                  className="flex-1"
                >
                  Voltar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="glass-card w-full max-w-md animate-glass-fade">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Database className="w-8 h-8 text-primary" />
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? '🔐 Login' : '📝 Criar Conta'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Entre com sua conta'
              : hasUsers 
                ? 'Crie uma nova conta'
                : 'Seja o primeiro usuário!'
            }
          </CardDescription>
          <div className="mt-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-800 dark:text-green-200">
                ☁️ Seus dados são salvos automaticamente na nuvem
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">
                {isLogin ? 'Nome de Usuário' : 'Nome'}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input pl-10"
                  placeholder={isLogin ? "Digite seu nome" : "Seu nome"}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass-input pl-10 pr-10"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="securityQuestion">Pergunta de Segurança</Label>
                  <Input
                    id="securityQuestion"
                    type="text"
                    value={formData.securityQuestion}
                    onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                    className="glass-input"
                    placeholder="Ex: Qual o nome do meu primeiro pet?"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="securityAnswer">Resposta</Label>
                  <Input
                    id="securityAnswer"
                    type="text"
                    value={formData.securityAnswer}
                    onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                    className="glass-input"
                    placeholder="Digite a resposta"
                    required
                  />
                </div>
              </>
            )}
            
            <Button type="submit" className="glass-button w-full">
              {isLogin ? '🔐 Entrar' : '✨ Criar Conta'}
            </Button>
            
            <div className="text-center space-y-2">
              {hasUsers && (
                <button
                  type="button"
                  onClick={() => setIsResetting(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              )}
              
              <div>
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {isLogin ? '📝 Criar nova conta' : '🔐 Já tem conta? Entre aqui'}
                </button>
              </div>
              

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
