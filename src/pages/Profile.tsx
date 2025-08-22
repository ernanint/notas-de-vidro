import { useState } from "react";
import { User, Lock, HelpCircle, LogOut, Settings, Shield, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";

export const Profile = () => {
  const { getUserName, logout, resetPassword } = useAuth();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [resetAnswer, setResetAnswer] = useState("");

  const userName = getUserName();
  const securityQuestion = localStorage.getItem('glassnotes_security_question');

  const handleResetPassword = () => {
    const success = resetPassword(resetAnswer);
    if (success) {
      setShowResetDialog(false);
      setResetAnswer("");
    }
  };

  const handleDeleteAccount = () => {
    // Clear all user data
    localStorage.removeItem('glassnotes_user');
    localStorage.removeItem('glassnotes_security_question');
    localStorage.removeItem('glassnotes_notes');
    localStorage.removeItem('glassnotes_tasks');
    sessionStorage.removeItem('glassnotes_auth');
    
    toast({
      title: "🗑️ Conta excluída",
      description: "Todos os dados foram removidos permanentemente",
      duration: 3000,
    });
    
    // Reload the page to reset everything
    window.location.reload();
  };

  const getStorageStats = () => {
    const notes = JSON.parse(localStorage.getItem('glassnotes_notes') || '[]');
    const tasks = JSON.parse(localStorage.getItem('glassnotes_tasks') || '[]');
    
    return {
      notesCount: notes.length,
      tasksCount: tasks.length,
      completedTasks: tasks.filter((task: any) => task.completed).length
    };
  };

  const stats = getStorageStats();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Perfil
          </h1>
          <p className="text-muted-foreground">Gerencie sua conta e configurações</p>
        </div>

        {/* User Info Card */}
        <Card className="glass-card animate-glass-fade">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-xl">Olá, {userName}!</CardTitle>
            <CardDescription>Bem-vindo ao GlassNotes</CardDescription>
          </CardHeader>
        </Card>

        {/* Statistics Card */}
        <Card className="glass-card animate-glass-fade delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.notesCount}</div>
                <div className="text-xs text-muted-foreground">Notas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{stats.tasksCount}</div>
                <div className="text-xs text-muted-foreground">Tarefas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="glass-card animate-glass-fade delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Gerencie sua senha e configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setShowResetDialog(true)}
              variant="outline"
              className="w-full justify-start"
            >
              <Lock className="w-4 h-4 mr-2" />
              Alterar senha
            </Button>
            
            <div className="p-3 rounded-lg bg-muted/20 border border-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Pergunta de Segurança</span>
              </div>
              <p className="text-sm text-muted-foreground">{securityQuestion}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="glass-card animate-glass-fade delay-300">
          <CardContent className="pt-6 space-y-3">
            <Button
              onClick={logout}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da conta
            </Button>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="w-full justify-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir conta permanentemente
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="glass-popup">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Responda à pergunta de segurança para continuar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Sua pergunta:</Label>
              <p className="mt-1 p-2 rounded bg-muted/20 text-sm">{securityQuestion}</p>
            </div>
            
            <div>
              <Label htmlFor="answer">Resposta</Label>
              <Input
                id="answer"
                type="text"
                value={resetAnswer}
                onChange={(e) => setResetAnswer(e.target.value)}
                className="glass-input"
                placeholder="Digite sua resposta"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleResetPassword} className="flex-1">
                Confirmar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowResetDialog(false);
                  setResetAnswer("");
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-popup">
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Conta</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os seus dados (notas, tarefas e configurações) 
              serão perdidos permanentemente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Tem certeza que deseja continuar?
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleDeleteAccount}
              variant="destructive" 
              className="flex-1"
            >
              Sim, excluir tudo
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};