import { useState } from "react";
import { User, Lock, LogOut, Settings, Shield, Trash2, Database, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { useFirebaseSharedNotes } from "../hooks/useFirebaseSharedNotes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useNavigate } from "react-router-dom";

export const ProfileFirebase = () => {
  const { currentUser, logout } = useFirebaseAuth();
  const { sharedNotes } = useFirebaseSharedNotes();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const handleBackToModeSelector = () => {
    navigate('/');
  };

  const getStorageStats = () => {
    const myNotes = sharedNotes.filter(note => note.owner === currentUser);
    const sharedWithMe = sharedNotes.filter(note => note.owner !== currentUser);
    
    return {
      totalNotes: sharedNotes.length,
      myNotes: myNotes.length,
      sharedWithMe: sharedWithMe.length,
      collaborations: myNotes.reduce((total, note) => total + note.sharedWith.length, 0)
    };
  };

  const stats = getStorageStats();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            👤 Perfil
          </h1>
          <p className="text-muted-foreground">Gerencie sua conta</p>
        </div>

        {/* User Info Card */}
        <Card className="glass-card animate-glass-fade">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-600 mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-xl">Olá, {currentUser}!</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Database className="w-4 h-4 text-green-500" />
                <span>Conectado ao Firebase</span>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Firebase Statistics */}
        <Card className="glass-card animate-glass-fade delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Estatísticas na Nuvem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.myNotes}</div>
                <div className="text-xs text-muted-foreground">Suas Notas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{stats.sharedWithMe}</div>
                <div className="text-xs text-muted-foreground">Compartilhadas</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center pt-2 border-t border-muted/20">
              <div>
                <div className="text-lg font-bold text-orange-500">{stats.collaborations}</div>
                <div className="text-xs text-muted-foreground">Colaborações</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-500">{stats.totalNotes}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="glass-card animate-glass-fade delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança Firebase
            </CardTitle>
            <CardDescription>
              Seus dados estão protegidos na nuvem do Google
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Status da Conexão</span>
              </div>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>✅ Conectado ao Firebase</li>
                <li>✅ Dados sincronizados</li>
                <li>✅ Backup automático</li>
                <li>✅ Compartilhamento em tempo real</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="glass-card animate-glass-fade delay-300">
          <CardContent className="pt-6 space-y-3">
            <Button
              onClick={handleBackToModeSelector}
              variant="outline"
              className="w-full justify-start"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
            
            <Button
              onClick={() => setShowLogoutDialog(true)}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da conta Firebase
            </Button>
            
            <div className="pt-2 border-t border-muted/20">
              <p className="text-xs text-muted-foreground text-center">
                Seus dados ficam seguros no Firebase mesmo após logout
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Firebase Info */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold mb-2">Firebase by Google</h3>
              <p className="text-xs text-muted-foreground">
                Seus dados são armazenados com segurança nos servidores do Google Firebase,
                permitindo acesso de qualquer dispositivo e compartilhamento em tempo real.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="glass-popup">
          <DialogHeader>
            <DialogTitle>Sair da conta Firebase?</DialogTitle>
            <DialogDescription>
              Você será desconectado do Firebase, mas seus dados ficarão seguros na nuvem.
              Você pode fazer login novamente a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleLogout}
              className="flex-1"
            >
              Sim, sair
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowLogoutDialog(false)}
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
