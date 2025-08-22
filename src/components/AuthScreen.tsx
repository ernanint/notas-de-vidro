import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Lock, User, HelpCircle } from "lucide-react";

export const AuthScreen = () => {
  const { login, register, isRegistered, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
    resetAnswer: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResetting) {
      const success = resetPassword(formData.resetAnswer);
      if (success) {
        setIsResetting(false);
        setFormData({ ...formData, password: "", resetAnswer: "" });
      }
      return;
    }

    if (isLogin) {
      login(formData.name, formData.password);
    } else {
      register(formData.name, formData.password, formData.securityQuestion, formData.securityAnswer);
    }
  };

  const switchMode = () => {
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
                <Label htmlFor="question" className="text-sm font-medium">
                  Sua pergunta de segurança:
                </Label>
                <p className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">
                  {localStorage.getItem('glassnotes_security_question')}
                </p>
              </div>
              
              <div>
                <Label htmlFor="resetAnswer">Resposta</Label>
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
          <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">
            {isRegistered ? 'Entrar' : 'Bem-vindo ao'} GlassNotes
          </CardTitle>
          <CardDescription>
            {isRegistered 
              ? 'Digite seu nome e senha para acessar suas notas'
              : 'Configure sua conta para começar'
            }
          </CardDescription>
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
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
            
            {isRegistered && (
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setIsResetting(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
                
                {!isLogin && (
                  <div>
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Já tem conta? Entre aqui
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {!isRegistered && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {isLogin ? 'Criar nova conta' : 'Já tem conta? Entre aqui'}
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};